export interface MenuDetailPair {
  key: string;
  keyEn: string;
  value: string;
  valueEn: string;
}

export function parseDetailsPairs(details?: unknown): MenuDetailPair[] {
  if (!details) return [];

  if (Array.isArray(details)) {
    return details.map((entry: any) => ({
      key: entry.key ?? entry.keyAr ?? '',
      keyEn: entry.keyEn ?? entry.key ?? '',
      value: String(entry.value ?? entry.valueAr ?? ''),
      valueEn: String(entry.valueEn ?? entry.value ?? ''),
    }));
  }

  if (typeof details === 'object') {
    return Object.entries(details as Record<string, unknown>).map(([k, v]) => ({
      key: k,
      keyEn: k,
      value: String(v),
      valueEn: String(v),
    }));
  }

  return [];
}

export function buildDetailsPayload(pairs: MenuDetailPair[]): MenuDetailPair[] {
  return pairs
    .filter((p) => p.key.trim() || p.keyEn.trim())
    .map((p) => ({
      key: p.key.trim(),
      keyEn: p.keyEn.trim() || p.key.trim(),
      value: p.value,
      valueEn: p.valueEn || p.value,
    }));
}

export function formatDetailLabel(pair: MenuDetailPair, isEnglish: boolean): string {
  return isEnglish && pair.keyEn ? pair.keyEn : pair.key;
}

export function formatDetailValue(pair: MenuDetailPair, isEnglish: boolean): string {
  return isEnglish && pair.valueEn ? pair.valueEn : pair.value;
}

export function getDetailsEntries(details?: unknown): MenuDetailPair[] {
  return parseDetailsPairs(details).filter((p) => p.key || p.keyEn);
}
