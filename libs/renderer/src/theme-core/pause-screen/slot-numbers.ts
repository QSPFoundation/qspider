/** The save slot numbers `1..count`. */
export function slotNumbers(count: number): number[] {
  return Array.from({ length: count }, (_, index) => index + 1);
}
