/** The value of an item's `--*-image` CSS variable: a `url()` of the image, or empty when the item has none. */
export function imageVariable(image: string | undefined): string {
  return image ? `url("${image}")` : '';
}
