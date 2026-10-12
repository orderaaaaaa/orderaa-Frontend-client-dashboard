function decodeBase64Url(segment: string): string {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function decodeExpiry(token: string): number | null {
  const segments = token.split('.');
  if (segments.length !== 3) return null;
  try {
    const payload: unknown = JSON.parse(decodeBase64Url(segments[1]));
    if (typeof payload !== 'object' || payload === null) return null;
    const exp = (payload as { exp?: unknown }).exp;
    return typeof exp === 'number' ? exp : null;
  } catch {
    return null;
  }
}

export function msUntilExpiry(token: string, now = Date.now()): number | null {
  const exp = decodeExpiry(token);
  return exp === null ? null : exp * 1000 - now;
}

export function isUnexpired(token: string, now = Date.now()): boolean {
  const remaining = msUntilExpiry(token, now);
  return remaining !== null && remaining > 0;
}
