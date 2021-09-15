import React, { useCallback, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useGameManager } from '../../../game/manager';
import { useClickCoordinates } from '../../../hooks/click-coordinates';
import { useOutsideClick } from '../../../hooks/useOutsideClick';
import { usePopper } from 'react-popper';
import styled from '@emotion/styled';
import { AeroActionList } from '../aero-action-list';
import { useAeroLayout } from '../../../game/aero/aero-layout';
import { MenuUI } from '@qspider/qsp-wasm';
import { useImageSize } from '../../../hooks/image-size';
import { useResources } from '../../../game/resource-manager';
import { AeroEffect } from '../effects/aero-effect';

export const MenuWrapper = styled.div<{ menuUI: MenuUI; url: string }>`
  position: relative;
  border: ${(props) => props.menuUI.borderWidth || 0}px solid ${(props) => props.menuUI.borderColor};
  background-color: ${(props) => (props.menuUI.backImage ? 'transparent' : props.theme.backgroundColor)};
  background-image: ${(props) => props.url || 'none'};
  padding: ${(props) => props.menuUI.padding || 0}px;
`;

const MenuList = styled.div<{ menuUI: MenuUI }>`
  width: ${(props) => props.menuUI.list.width}px;
`;

const FixedMenuWrapper = styled.div<{ menuUI: MenuUI; width: number; height: number; url: string }>`
  position: relative;
  width: ${(props) => props.width}px;
  height: ${(props) => props.width}px;
  border: ${(props) => props.menuUI.borderWidth || 0}px solid ${(props) => props.menuUI.borderColor};
  background-color: ${(props) => (props.menuUI.backImage ? 'transparent' : props.theme.backgroundColor)};
  background-image: ${(props) => props.url || 'none'};
  padding: ${(props) => props.menuUI.padding || 0}px;
`;

const FixedMenuList = styled.div<{ menuUI: MenuUI }>`
  position: absolute;
  left: ${(props) => props.menuUI.list.x}px;
  top: ${(props) => props.menuUI.list.y}px;
  width: ${(props) => props.menuUI.list.width}px;
  height: ${(props) => props.menuUI.list.height}px;
`;

function generateGetBoundingClientRect(x = 0, y = 0) {
  return () => ({
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

  const coordinates = useClickCoordinates();
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
  const [popperElement, setPopperElement] = React.useState(null);
  const node = useOutsideClick(() => manager.selectMenu(-1));
  const { styles, attributes } = usePopper(virtualElement, popperElement);
  const { url } = resources.get(layout.menuUI.backImage);
  const { width, height } = useImageSize(url);

  const onMenuSelect = useCallback((index: number) => manager.selectMenu(index), [manager]);

  if (layout.menuUI.fixedSize) {
    return (
      <AeroEffect show={manager.isMenuShown} effect={layout.menuUI.effect.name} duration={layout.menuUI.effect.time}>
        <div ref={setPopperElement} style={styles.popper} {...attributes.popper}>
          <FixedMenuWrapper ref={node} menuUI={layout.menuUI} width={width} height={height} url={url}>
            <FixedMenuList menuUI={layout.menuUI}>
              <AeroActionList actions={manager.menu} type="menuUI" onSelect={onMenuSelect}></AeroActionList>
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
            <AeroActionList actions={manager.menu} type="menuUI" onSelect={onMenuSelect}></AeroActionList>
          </MenuList>
        </MenuWrapper>
      </div>
    </AeroEffect>
  );
});
