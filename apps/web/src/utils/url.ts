const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

export function isSafeUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return ALLOWED_PROTOCOLS.has(url.protocol);
  } catch {
    return false;
  }
}
