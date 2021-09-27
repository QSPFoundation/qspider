import React, { useEffect, useRef } from 'react';

import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import OverlayScrollbars from 'overlayscrollbars';
import { observer } from 'mobx-react-lite';

OverlayScrollbars.extension('scrollState', function () {
  const osInstance = this; // eslint-disable-line @typescript-eslint/no-this-alias
  const extension: OverlayScrollbars.Extension = {
    contract() {
      return true;
    },
    added(): void {
      // noop
    },
    removed(): void {
      // noop
    },
    on(callbackName, callbackArgs) {
      console.log(callbackName);
      if (callbackName === 'scrollStop' || callbackName === 'overflowAmountChanged') {
        const state = osInstance.getState();
        const instanceElements = osInstance.getElements();

        const scrollbarVertical = instanceElements.scrollbarVertical.scrollbar;
        if (instanceElements.viewport.scrollTop > 0) {
          scrollbarVertical.classList.add('show-up-arrow');
        } else {
          scrollbarVertical.classList.remove('show-up-arrow');
        }
        if (instanceElements.viewport.scrollTop < state.overflowAmount.y) {
          scrollbarVertical.classList.add('show-down-arrow');
        } else {
          scrollbarVertical.classList.remove('show-down-arrow');
        }
        console.log(state.overflowAmount.y, instanceElements.viewport.scrollTop);
      }
    },
  };

  return extension;
});

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
    return (
      <OverlayScrollbarsComponent
        ref={scrollRef}
        style={{ maxHeight: '100%' }}
        options={{ className: 'os-theme-aero', scrollbars: { clickScrolling: true }, autoUpdate: true }}
        extensions={['scrollState']}
      >
        {children}
      </OverlayScrollbarsComponent>
    );
  }
);
