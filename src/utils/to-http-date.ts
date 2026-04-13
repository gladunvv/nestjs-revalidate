export function toHttpDate(value: Date): string {
  return value.toUTCString();
}
