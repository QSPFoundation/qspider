/** Where a dialog or menu opens: a negative `*_X` or `*_Y` means at the mouse, otherwise at the given point. */
export function aeroPosition(
  x: number,
  y: number,
  mouse: { x: number; y: number },
): { x: number; y: number; atMouse: boolean } {
  const atMouse = x < 0 || y < 0;
  return { x: atMouse ? mouse.x : x, y: atMouse ? mouse.y : y, atMouse };
}

export function dialogClassName(atMouse: boolean): string {
  return `qsp-dialog-container${atMouse ? ' at-mouse' : ''}`;
}

/** The menu's class list with the fixed-size marker appended; callers trim it. */
export function menuClassName(base: string | undefined, isFixed: boolean): string {
  let className = base || '';
  if (isFixed) className += ' aero-fixed-menu';
  return className;
}
