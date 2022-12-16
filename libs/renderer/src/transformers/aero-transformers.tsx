import { extractAttributes } from '@qspider/game-state';
import { Node } from 'interweave';
import { AeroEffect } from '../aero/aero-effect';
export const aeroTransformers: Record<string, (node: HTMLElement, children: Node[]) => React.ReactNode | null> = {
  'aero-effect'(node, children) {
    const { name, duration, sequence, key } = extractAttributes(node);
    return (
      <AeroEffect effectVar={name} durationVar={duration} sequenceVar={sequence} animationKey={key}>
        {children}
      </AeroEffect>
    );
  },
};
