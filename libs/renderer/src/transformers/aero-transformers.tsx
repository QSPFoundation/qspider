import { extractAttributes } from '@qspider/game-state';
import { Node } from 'interweave';
import { AeroEffect } from './aero/aero-effect';
import { AeroQspMenu } from './aero/aero-menu';
import { AeroStyles } from './aero/aero-styles';
import { AeroQspView } from './aero/aero-view';
export const aeroTransformers: Record<string, (node: HTMLElement, children: Node[]) => React.ReactNode | null> = {
  'aero-effect'(node, children) {
    const { name, duration, sequence, key } = extractAttributes(node);
    return (
      <AeroEffect effectVar={name} durationVar={duration} sequenceVar={sequence} animationKey={key}>
        {children}
      </AeroEffect>
    );
  },
  'aero-styles'() {
    return <AeroStyles />;
  },
  'qsp-menu'(node, children) {
    const attrs = extractAttributes(node);
    return <AeroQspMenu attrs={attrs}>{children}</AeroQspMenu>;
  },
  'qsp-view'(node, children) {
    const attributes = extractAttributes(node);
    return (
      <AeroQspView attrs={attributes} modal={'modal' in attributes}>
        {children}
      </AeroQspView>
    );
  },
};
