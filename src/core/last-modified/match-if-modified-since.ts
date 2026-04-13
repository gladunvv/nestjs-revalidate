export function matchesIfModifiedSince(
  currentLastModified: Date | undefined,
  header: string | undefined,
): boolean {
  if (!currentLastModified || !header) {
    return false;
  }

  const since = new Date(header);
  if (Number.isNaN(since.getTime())) {
    return false;
  }

  return currentLastModified.getTime() <= since.getTime();
}
