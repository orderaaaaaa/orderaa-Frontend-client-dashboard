const TOKEN_BYTES = 24;

export function generateWebhookToken(): string {
  const bytes = new Uint8Array(TOKEN_BYTES);
  crypto.getRandomValues(bytes);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function buildWebhookUrl(
  apiUrl: string | undefined,
  provider: string,
  storeId: number,
  token?: string
): string {
  if (!apiUrl) return '';
  const base = `${apiUrl}/webhook/orders/${provider}/${storeId}`;
  return token ? `${base}?token=${encodeURIComponent(token)}` : base;
}
