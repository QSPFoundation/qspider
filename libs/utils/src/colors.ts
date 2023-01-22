import Color from 'color';

export function convertColor(value: number, withAlpha = true): string | null {
  if (!value) return null;
  const arr = new Uint8Array(4);
  const view = new DataView(arr.buffer);
  view.setInt32(0, value);

  if (withAlpha) {
    const [alpha, blue, green, red] = arr;
    return `rgba(${red},${green},${blue},${alpha / 255})`;
  }

  const [, blue, green, red] = arr;
  return `rgb(${red},${green},${blue})`;
}

export function invertColor(color: string): string {
  return Color(color).negate().hex();
}

export function getContrastColor(input: string): string {
  const color = Color(input);
  const r = color.red();
  const g = color.green();
  const b = color.blue();
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? 'black' : 'white';
}
