import { extractAttributes } from '@qspider/game-state';
import { TransformCallback } from '@qspider/html-renderer';
import { AeroQspMenu, AeroQspMenuItem, AeroQspMenuList } from './aero/aero-menu';
import { AeroStyles } from './aero/aero-styles';
import { AeroQspView } from './aero/aero-view';
import { AeroQspActionItem, AeroQspActionsList } from './aero/aero-actions';
import { AeroQspStatsContent } from './aero/aero-stats';
import { AeroQspMainContent } from './aero/aero-main';
import { AeroQspMsg, AeroQspMsgContent } from './aero/aero-msg';
import { AeroQspInput, AeroQspInputContent } from './aero/aero-input';
import { AeroQspObjectItem, AeroQspObjectsList } from './aero/aero-objects';
import { AeroNewlocEffect } from './aero/aero-newloc-effect';

export const aeroTransformers: Record<string, TransformCallback> = {
  'aero-newloc-effect'(node, children) {
    return <AeroNewlocEffect>{children}</AeroNewlocEffect>;
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
  'qsp-actions-list'(node, children) {
    return <AeroQspActionsList attrs={extractAttributes(node)}>{children}</AeroQspActionsList>;
  },
  'qsp-action'(node) {
    return <AeroQspActionItem attrs={extractAttributes(node)}></AeroQspActionItem>;
  },
  'qsp-objects-list'(node, children) {
    return <AeroQspObjectsList attrs={extractAttributes(node)}>{children}</AeroQspObjectsList>;
  },
  'qsp-object'(node, children) {
    return <AeroQspObjectItem attrs={extractAttributes(node)}>{children}</AeroQspObjectItem>;
  },
  'qsp-menu'(node, children) {
    const attrs = extractAttributes(node);
    return <AeroQspMenu attrs={attrs}>{children}</AeroQspMenu>;
  },
  'qsp-menu-list'(node, children) {
    return <AeroQspMenuList attrs={extractAttributes(node)}>{children}</AeroQspMenuList>;
  },
  'qsp-menu-item'(node, children) {
    const attrs = extractAttributes(node);
    return <AeroQspMenuItem attrs={attrs}>{children}</AeroQspMenuItem>;
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
