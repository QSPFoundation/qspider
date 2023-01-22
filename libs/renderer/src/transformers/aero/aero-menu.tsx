import { Attributes, menu$, selectMenuItem, useQspVariable } from '@qspider/game-state';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useAtom } from '@xoid/react';
import { ReactNode } from 'react';
import { useAttributes } from '../../content/attributes';
import { useClickCoordinates } from '../../hooks/click-coordinates';

export const AeroQspMenu: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs, children }) => {
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-menu');
  const isVisible = useAtom(menu$);
  const coordinates = useClickCoordinates();
  const isFixed = useQspVariable('FIXED_SIZE_MENU', '', 0, 0);
  const menuX = useQspVariable('MENU_X', '', 0, -1);
  const menuY = useQspVariable('MENU_Y', '', 0, -1);
  if (!isVisible) return null;
  const useMouseCordinates = menuX < 0 || menuY < 0;
  const left = useMouseCordinates ? coordinates.x : menuX;
  const top = useMouseCordinates ? coordinates.y : menuY;
  console.log({
    isFixed,
    coordinates,
    useMouseCordinates,
    menuX,
    menuY,
  });
  let className = attributes['className'] || '';
  if (isFixed) className += ' aero-fixed-menu';
  return (
    <DropdownMenu.Root open={true} onOpenChange={(): void => selectMenuItem(-1)}>
      <DropdownMenu.Trigger asChild>
        <div
          style={{
            position: 'fixed',
            left,
            top,
          }}
        ></div>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal container={document.getElementById('portal-container')}>
        <DropdownMenu.Content align="start">
          <Tag style={style} {...attributes} className={className.trim()}>
            {children}
          </Tag>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
