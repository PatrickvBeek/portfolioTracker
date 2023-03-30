export function getRandomString(len: number): string {
  return Math.random().toString(36).substring(2, 7);
}
