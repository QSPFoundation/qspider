export function isTouchDevice() {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    ('msMaxTouchPoints' in navigator && (navigator as { msMaxTouchPoints: number }).msMaxTouchPoints > 0)
  );
}
