export function convertColor(value: number, withAlpha = true): string | null {
  if (!value) return null;
  const arr = new Uint8Array(4);
  const view = new DataView(arr.buffer);
  view.setInt32(0, value);

  if (withAlpha) {
    const [alpha, blue, green, red] = arr;
    return `rgba(${red},${green},${blue},${alpha / 256})`;
  }

  const [, blue, green, red] = arr;
  return `rgb(${red},${green},${blue})`;
}
