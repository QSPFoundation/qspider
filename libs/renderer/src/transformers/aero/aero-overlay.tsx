import { Overlay } from '@radix-ui/react-dialog';
import { animated, useSpring } from '@react-spring/web';
import { useQspVariable } from '@qspider/game-state';
import { forwardRef } from 'react';

export const AeroOverlay: React.FC = forwardRef(() => {
  const isShadeDisabled = useQspVariable('DISABLESHADE', '', 0, 0);
  const style = useSpring({
    from: { opacity: 0 },
    to: { opacity: 0.8 },
  });
  if (isShadeDisabled) return null;
  return (
    <Overlay forceMount asChild>
      <animated.div style={style} className="qsp-overlay"></animated.div>
    </Overlay>
  );
});
