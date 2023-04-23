import { extractAttributes } from '@qspider/game-state';
import { Node } from 'interweave';
import { AeroEffect } from './aero/aero-effect';
import { AeroQspMenu } from './aero/aero-menu';
import { AeroStyles } from './aero/aero-styles';
import { AeroQspView } from './aero/aero-view';
import { AeroQspActionsList } from './aero/aero-actions';
import { AeroQspStatsContent } from './aero/aero-stats';
import { AeroQspMainContent } from './aero/aero-main';
import { AeroQspMsg, AeroQspMsgContent } from './aero/aero-msg';
import { AeroQspInput, AeroQspInputContent } from './aero/aero-input';
import { AeroQspObjectsList } from './aero/aero-objects';
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
  'qsp-main-content'(node) {
    return <AeroQspMainContent attrs={extractAttributes(node)} />;
  },
  'qsp-stats-content'(node) {
    return <AeroQspStatsContent attrs={extractAttributes(node)} />;
  },
  'qsp-actions-list'(node) {
    return <AeroQspActionsList attrs={extractAttributes(node)} />;
  },
  'qsp-objects-list'(node) {
    return <AeroQspObjectsList attrs={extractAttributes(node)} />;
  },

  'qsp-menu'(node, children) {
    const attrs = extractAttributes(node);
    return <AeroQspMenu attrs={attrs}>{children}</AeroQspMenu>;
  },
  'qsp-msg'(node, children) {
    return <AeroQspMsg attrs={extractAttributes(node)}>{children}</AeroQspMsg>;
  },
  'qsp-msg-content'(node) {
    return <AeroQspMsgContent attrs={extractAttributes(node)} />;
  },
  'qsp-input'(node, children) {
    const attributes = extractAttributes(node);
    return <AeroQspInput attrs={attributes}>{children}</AeroQspInput>;
  },
  'qsp-input-content'(node) {
    return <AeroQspInputContent attrs={extractAttributes(node)} />;
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
