export function fillFormat(format: string, values: Record<string, string>): string {
  let result = format;
  for (const [placeholder, value] of Object.entries(values)) {
    result = result.replace(placeholder, value);
  }
  return result;
}
