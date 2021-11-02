import React, { useCallback, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { usePopper } from 'react-popper';
import styled from '@emotion/styled';
import { AeroActionList } from '../aero-action-list';
import { MenuUI } from '@qspider/qsp-wasm';
import { AeroEffect } from '../effects/aero-effect';
import { useGameManager, useResources } from '@qspider/providers';
import { useAeroLayout } from '../aero-layout';
import { hooks } from '@qspider/components';
import { noop } from '@qspider/utils';

export const MenuWrapper = styled.div<{ menuUI: MenuUI; url: string }>`
  position: relative;
  border: ${(props): number => props.menuUI.borderWidth || 0}px solid ${(props): string => props.menuUI.borderColor};
  background-color: ${(props): string => (props.menuUI.backImage ? 'transparent' : props.theme.backgroundColor)};
  background-image: ${(props): string => (props.menuUI.backImage ? `url("${props.url}")` : 'none')};
  padding: ${(props): number => props.menuUI.padding || 0}px;
`;

const MenuList = styled.div<{ menuUI: MenuUI }>`
  width: ${(props): number => props.menuUI.list.width}px;
`;

const FixedMenuWrapper = styled.div<{ menuUI: MenuUI; width: number; height: number; url: string }>`
  position: relative;
  width: ${(props): number => props.width}px;
  height: ${(props): number => props.width}px;
  border: ${(props): number => props.menuUI.borderWidth || 0}px solid ${(props): string => props.menuUI.borderColor};
  background-color: ${(props): string => (props.menuUI.backImage ? 'transparent' : props.theme.backgroundColor)};
  background-image: ${(props): string => (props.menuUI.backImage ? `url("${props.url}")` : 'none')};
  padding: ${(props): number => props.menuUI.padding || 0}px;
`;

const FixedMenuList = styled.div<{ menuUI: MenuUI }>`
  position: absolute;
  left: ${(props): number => props.menuUI.list.x}px;
  top: ${(props): number => props.menuUI.list.y}px;
  width: ${(props): number => props.menuUI.list.width}px;
  height: ${(props): number => props.menuUI.list.height}px;
`;

function generateGetBoundingClientRect(x = 0, y = 0) {
  return (): {
    width: number;
    height: number;
    top: number;
    right: number;
    bottom: number;
    left: number;
  } => ({
    width: 0,
    height: 0,
    top: y,
    right: x,
    bottom: y,
    left: x,
  });
}

export const AeroMenu: React.FC = observer(() => {
  const manager = useGameManager();
  const layout = useAeroLayout();
  const resources = useResources();

  const coordinates = hooks.useClickCoordinates();
  const [virtualElement, setVirtualElement] = React.useState({
    getBoundingClientRect: generateGetBoundingClientRect(),
  });
  const x = layout.menuUI && layout.menuUI.x >= 0 ? layout.menuUI.x : coordinates.x;
  const y = layout.menuUI && layout.menuUI.y >= 0 ? layout.menuUI.y : coordinates.y;
  useEffect(() => {
    setVirtualElement({
      getBoundingClientRect: generateGetBoundingClientRect(x, y),
    });
  }, [x, y]);
  const [popperElement, setPopperElement] = React.useState<HTMLDivElement | null>(null);
  const node = hooks.useOutsideClick(() => manager.selectMenu(-1));
  const { styles, attributes } = usePopper(virtualElement, popperElement);
  const { url } = resources.get(layout.menuUI.backImage);
  const { width, height } = hooks.useImageSize(url);

  const onMenuSelect = useCallback((index: number) => manager.selectMenu(index), [manager]);

  if (layout.menuUI.fixedSize) {
    return (
      <AeroEffect show={manager.isMenuShown} effect={layout.menuUI.effect.name} duration={layout.menuUI.effect.time}>
        <div ref={setPopperElement} style={styles.popper} {...attributes.popper}>
          <FixedMenuWrapper ref={node} menuUI={layout.menuUI} width={width} height={height} url={url}>
            <FixedMenuList menuUI={layout.menuUI}>
              <AeroActionList
                actions={manager.menu}
                type="menuUI"
                onSelect={noop}
                onAction={onMenuSelect}
              ></AeroActionList>
            </FixedMenuList>
          </FixedMenuWrapper>
        </div>
      </AeroEffect>
    );
  }

  return (
    <AeroEffect show={manager.isMenuShown} effect={layout.menuUI.effect.name} duration={layout.menuUI.effect.time}>
      <div ref={setPopperElement} style={styles.popper} {...attributes.popper}>
        <MenuWrapper ref={node} menuUI={layout.menuUI} url={url}>
          <MenuList menuUI={layout.menuUI}>
            <AeroActionList
              actions={manager.menu}
              type="menuUI"
              onSelect={noop}
              onAction={onMenuSelect}
            ></AeroActionList>
          </MenuList>
        </MenuWrapper>
      </div>
    </AeroEffect>
  );
});
