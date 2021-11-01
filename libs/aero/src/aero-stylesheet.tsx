import React, { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { useAeroLayout } from '../../game/aero/aero-layout';

export const AeroStylesheet: React.FC = observer(() => {
  const ref = useRef<HTMLStyleElement>(null);
  const layout = useAeroLayout();
  useEffect(() => {
    if (ref.current) {
      ref.current.textContent = layout.playerUI.styles;
    }
  }, [layout.playerUI, layout.playerUI.styles]);
  return <style ref={ref} type="text/css"></style>;
});
