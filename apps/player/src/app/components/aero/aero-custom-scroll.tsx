import React, { useEffect, useRef } from 'react';

import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import { observer } from 'mobx-react-lite';
import { useAeroLayout } from '../../game/aero/aero-layout';
import { useResources } from '../../game/resource-manager';
import { useImageSize } from '../../hooks/image-size';

import defaultUpArrow from '../../../assets/aero/up_arrow.png';
import defaultDownArrow from '../../../assets/aero/down_arrow.png';

export const AeroCustomScroll: React.FC<{ scrollY?: string; scrollX?: string }> = observer(
  ({ scrollY, scrollX, children }) => {
    const scrollRef = useRef<OverlayScrollbarsComponent>();
    useEffect(() => {
      const ref = scrollRef.current;
      if (ref) {
        const scrollInstance = ref.osInstance();
        if (scrollInstance) {
          const coordinates: { x?: string; y?: string } = {};
          if (scrollY) {
            coordinates.y = scrollY;
          }
          if (scrollX) {
            coordinates.x = scrollX;
          }

          scrollInstance.scroll(coordinates);
        }
      }
    });
    const layout = useAeroLayout();
    const resources = useResources();
    const upArrow = layout.scrollUI.upArrowImage ? resources.get(layout.scrollUI.upArrowImage).url : defaultUpArrow;
    const { width: upArrowWidth, height: upArrowHeight } = useImageSize(layout.scrollUI.upArrowImage);
    const downArrow = layout.scrollUI.downArrowImage
      ? resources.get(layout.scrollUI.downArrowImage).url
      : defaultDownArrow;
    const { width: downArrowWidth, height: downArrowHeight } = useImageSize(layout.scrollUI.downArrowImage);
    const style = {
      maxHeight: '100%',
      '--up-arrow': layout.scrollUI.hideArrows ? '' : `url(${upArrow})`,
      '--up-arrow-width': upArrowWidth + 'px',
      '--up-arrow-height': upArrowHeight + 'px',
      '--down-arrow': layout.scrollUI.hideArrows ? '' : `url(${downArrow})`,
      '--down-arrow-width': downArrowWidth + 'px',
      '--down-arrow-height': downArrowHeight + 'px',
    } as React.CSSProperties;

    return (
      <OverlayScrollbarsComponent
        ref={scrollRef}
        style={style}
        options={{ className: 'os-theme-aero', scrollbars: { clickScrolling: true } }}
      >
        {children}
      </OverlayScrollbarsComponent>
    );
  }
);
