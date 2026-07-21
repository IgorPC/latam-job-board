export function sleep(ms: number, jitter = 0.2): Promise<void> {
  const variation = ms * jitter * (Math.random() * 2 - 1);
  return new Promise((resolve) => setTimeout(resolve, Math.max(0, ms + variation)));
}
