import React, { useCallback, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { usePopper } from 'react-popper';
import styled from '@emotion/styled';
import { useGameManager } from '@qspider/providers';
import { hooks } from '@qspider/components';
import { ActionList } from './action-list/action-list';
import { noop } from '@qspider/utils';

export const MenuWrapper = styled.div`
  border: 1px solid var(--border-color);
  background-color: var(--background-color, transparent);
`;

function generateGetBoundingClientRect(x = 0, y = 0): () => DOMRect {
  return (): DOMRect => ({
    width: 0,
    height: 0,
    top: y,
    right: x,
    bottom: y,
    left: x,
    x,
    y,
    toJSON(): unknown {
      return { width: 0, height: 0, top: y, right: x, bottom: y, left: x, x, y };
    },
  });
}

export const Menu: React.FC = observer(() => {
  const manager = useGameManager();
  const coordinates = hooks.useClickCoordinates();
  const [virtualElement, setVirtualElement] = React.useState({
    getBoundingClientRect: generateGetBoundingClientRect(),
  });
  useEffect(() => {
    setVirtualElement({
      getBoundingClientRect: generateGetBoundingClientRect(coordinates.x, coordinates.y),
    });
  }, [coordinates]);
  const [popperElement, setPopperElement] = React.useState<HTMLDivElement | null>(null);
  const node = hooks.useOutsideClick(() => manager.selectMenu(-1));
  const { styles, attributes } = usePopper(virtualElement, popperElement);

  const onMenuSelect = useCallback((index: number) => manager.selectMenu(index), [manager]);
  if (!manager.isMenuShown) return null;

  return (
    <div ref={setPopperElement} style={styles.popper} {...attributes.popper}>
      <MenuWrapper ref={node} data-qsp="menu">
        <ActionList actions={manager.menu} onSelect={noop} onAction={onMenuSelect} dataQsp="menu-list" />
      </MenuWrapper>
    </div>
  );
});
