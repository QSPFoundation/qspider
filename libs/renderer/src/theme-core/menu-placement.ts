export interface MenuPlacement {
  triggerStyle: { position: 'fixed'; left?: number | string; right?: number; top?: number | string; bottom?: number };
  align: 'center' | 'start' | 'end';
  side: 'bottom' | 'left' | 'right' | 'top';
}

/**
 * Where the menu opens. `fixed` reads `showAt` ("<x> <y>", default "left top") and the offsets;
 * `mouse` opens at the click coordinates (0 when there was no click).
 */
export function menuPlacement(
  showAs: 'mouse' | 'fixed',
  showAt: string | undefined,
  offsetX: number,
  offsetY: number,
  coordinates: { x?: number; y?: number },
): MenuPlacement {
  const triggerStyle: MenuPlacement['triggerStyle'] = { position: 'fixed' };
  let align: MenuPlacement['align'] = 'start';
  let side: MenuPlacement['side'] = 'bottom';
  if (showAs === 'fixed') {
    const [x, y] = (showAt ?? 'left top').split(' ');
    switch (x) {
      case 'left':
        triggerStyle.left = offsetX;
        break;
      case 'center':
        triggerStyle.left = `calc(50% - ${offsetX}px)`;
        align = 'center';
        break;
      case 'right':
        triggerStyle.right = offsetX;
        align = 'end';
        break;
    }
    switch (y) {
      case 'top':
        triggerStyle.top = offsetY;
        break;
      case 'center':
        triggerStyle.top = `calc(50% - ${offsetY}px)`;
        side = 'left';
        break;
      case 'bottom':
        triggerStyle.bottom = offsetY;
        side = 'top';
        break;
    }
  } else {
    triggerStyle.left = coordinates.x ?? 0;
    triggerStyle.top = coordinates.y ?? 0;
  }
  return { triggerStyle, align, side };
}
