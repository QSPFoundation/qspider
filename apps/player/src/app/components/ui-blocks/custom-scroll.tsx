import React, { useEffect, useRef } from 'react';

import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';

export const CustomScroll: React.FC<{ scrollY?: string; scrollX?: string }> = ({ scrollY, scrollX, children }) => {
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
    <OverlayScrollbarsComponent ref={scrollRef} style={{ maxHeight: '100%' }}>
      {children}
    </OverlayScrollbarsComponent>
  );
};
