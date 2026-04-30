'use client';

import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface PushState {
  isSupported: boolean;
  permission: NotificationPermission | null;
  isSubscribed: boolean;
  isLoading: boolean;
}

export function usePushNotifications(workspaceId: string) {
  const [state, setState] = useState<PushState>({
    isSupported: false,
    permission: null,
    isSubscribed: false,
    isLoading: true,
  });

  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setState((s) => ({ ...s, isSupported: false, isLoading: false }));
        return;
      }

      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        if (cancelled) return;

        setSwRegistration(registration);

        const permission = Notification.permission;
        const subscription = await registration.pushManager.getSubscription();

        if (!cancelled) {
          setState({
            isSupported: true,
            permission,
            isSubscribed: !!subscription,
            isLoading: false,
          });
        }
      } catch {
        // Silently ignore — push notifications are optional
        if (!cancelled) {
          setState((s) => ({ ...s, isSupported: false, isLoading: false }));
        }
      }
    };

    init();
    return () => { cancelled = true; };
  }, []);

  const subscribe = useCallback(async () => {
    if (!swRegistration || !state.isSupported) return;

    setState((s) => ({ ...s, isLoading: true }));

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setState((s) => ({ ...s, permission, isLoading: false }));
        return;
      }

      const res = await fetch(`${API_BASE_URL}/v1/push/vapid-public-key`);
      if (!res.ok) {
        setState((s) => ({ ...s, permission, isLoading: false }));
        return;
      }

      const data = await res.json();
      const vapidPublicKey = data.data?.vapidPublicKey || data.vapidPublicKey;

      if (!vapidPublicKey || typeof vapidPublicKey !== 'string' || vapidPublicKey.length < 20) {
        setState((s) => ({ ...s, permission, isLoading: false }));
        return;
      }

      let applicationServerKey: Uint8Array;
      try {
        applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
      } catch {
        setState((s) => ({ ...s, permission, isLoading: false }));
        return;
      }

      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      await fetch(`${API_BASE_URL}/v1/push/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ workspaceId, subscription }),
      });

      setState({
        isSupported: true,
        permission: 'granted',
        isSubscribed: true,
        isLoading: false,
      });
    } catch {
      // Silently ignore — push notifications are optional
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, [swRegistration, state.isSupported, workspaceId]);

  const unsubscribe = useCallback(async () => {
    if (!swRegistration) return;

    setState((s) => ({ ...s, isLoading: true }));

    try {
      const subscription = await swRegistration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }

      await fetch(`${API_BASE_URL}/v1/push/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ workspaceId }),
      });

      setState((s) => ({ ...s, isSubscribed: false, isLoading: false }));
    } catch (err) {
      console.error('Unsubscribe error:', err);
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, [swRegistration, workspaceId]);

  return { ...state, subscribe, unsubscribe };
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
