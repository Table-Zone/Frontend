# Table Zone Frontend

## Structure

```
app/
├── (auth)/              # Auth pages (no sidebar)
│   ├── login/
│   ├── register/
│   ├── forgot-password/
│   └── reset-password/
├── (dashboard)/         # Dashboard pages (with sidebar)
│   ├── dashboard/       # Main table grid
│   └── settings/
│       ├── workspace/
│       ├── members/
│       ├── subscription/
│       └── profile/
├── onboarding/          # Workspace setup flow
├── subscription/        # Subscription page
├── invite/[token]/      # Accept invitation
├── layout.tsx           # Root layout
├── page.tsx             # Landing page
└── globals.css          # Global styles + brand colors

components/
├── ui/                  # shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── badge.tsx
│   └── dialog.tsx
├── tables/              # Table-specific components
│   └── TableCard.tsx    # Individual table card with timer
├── shared/              # Shared components
│   └── SubscriptionPopup.tsx
└── layout/              # Layout components

contexts/
├── AuthContext.tsx      # Auth state
└── LanguageContext.tsx  # i18n (AR/EN)

lib/
├── api.ts               # API client
└── utils.ts             # Helpers

public/
├── logo.svg             # Full logo
└── logo-icon.svg        # Icon only
```

## Brand Identity

| Element | Value |
|---------|-------|
| **Primary** | `#C75B12` (Spiced Pumpkin) |
| **Secondary** | `#1E1B18` (Espresso Black) |
| **Accent** | `#4CAF50` (Fresh Mint) |
| **Warning** | `#FF9800` (Amber) |
| **Alert** | `#F44336` (Crimson) |
| **Background** | `#FAF7F2` (Cream) |
| **Font AR** | Tajawal |
| **Font EN** | Inter |

## Quick Start

```bash
npm install
npm run dev
```

## Features

- ✅ RTL/LTR support (Arabic + English)
- ✅ Dark mode ready
- ✅ Mobile-first responsive
- ✅ Real-time WebSocket sync
- ✅ Animated UI (Framer Motion)
- ✅ shadcn/ui components
- ✅ Subscription-gated timers
- ✅ Bank transfer + receipt upload flow
