import { Node } from 'interweave';
import { extractAttributes, GameAction } from '@qspider/game-state';
import { QspActions, QspActionsList, QspActionName, QspActionImage, QspActionIndex } from '../theme-core/actions';
import { QspCloseButton, QspOkButton, QspCancelButton } from '../theme-core/buttons';
import { QspCmd, QspCmdInput } from '../theme-core/cmd';
import { QspInput, QspInputContent, QspInputTag } from '../theme-core/input';
import { QspMainContent } from '../theme-core/main-content';
import { QspMenu, QspMenuList, QspMenuItemName, QspMenuItemImage, QspMenuItemIndex } from '../theme-core/menu';
import { QspMsg, QspMsgContent } from '../theme-core/msg';
import { QspObjects, QspObjectsList, QspObjectName, QspObjectImage, QspObjectIndex } from '../theme-core/objects';
import {
  QspPauseScreenContent,
  QspPauseScreenCredits,
  QspPauseScreenPreferences,
  QspPauseScreenSave,
  QspPauseScreenLoad,
  QspSlotsList,
  QspSlotIndex,
  QspSlotDate,
} from '../theme-core/pause-screen';
import { QspButton } from '../theme-core/qsp-button';
import { QspRegion } from '../theme-core/qsp-region';
import { QspShow } from '../theme-core/qsp-show';
import { QspStyle } from '../theme-core/qsp-style';
import { QspVariable } from '../theme-core/qsp-variable';
import { QspScrollable } from '../theme-core/scrollable';
import { QspStats } from '../theme-core/stats';
import { QspStatsContent } from '../theme-core/stats-content';
import { QspView, QspViewImage } from '../theme-core/view';
import { Link } from './base/link';
import { Element } from '../content/element';
import { QspT } from '../qsp-t';
import { QspMain } from '../theme-core/main';
import { QspLayer } from '../theme-core/layer';

export function defaultTransform(node: HTMLElement, children: Node[]): React.ReactNode {
  const tagName = node.tagName.toLowerCase();
  const attributes = extractAttributes(node);
  return (
    <Element tagName={tagName} attrs={attributes}>
      {children}
    </Element>
  );
}

export const defaultTransformers: Record<string, (node: HTMLElement, children: Node[]) => React.ReactNode | null> = {
  'qsp-scrollable'(node, children) {
    const { scroll, ...attributes } = extractAttributes(node);
    return <QspScrollable attrs={attributes}>{children}</QspScrollable>;
  },
  'qsp-main'(node, children) {
    return <QspMain attrs={extractAttributes(node)}>{children}</QspMain>;
  },
  'qsp-main-content'(node) {
    return <QspMainContent attrs={extractAttributes(node)} />;
  },
  'qsp-stats'(node, children) {
    const attributes = extractAttributes(node);
    return <QspStats attrs={attributes}>{children}</QspStats>;
  },
  'qsp-stats-content'(node) {
    return <QspStatsContent attrs={extractAttributes(node)} />;
  },
  'qsp-actions'(node, children) {
    const attributes = extractAttributes(node);
    return <QspActions attrs={attributes}>{children}</QspActions>;
  },
  'qsp-actions-list'(node) {
    return <QspActionsList attrs={extractAttributes(node)} />;
  },
  'qsp-action-name'() {
    return <QspActionName />;
  },
  'qsp-action-image'(node) {
    return <QspActionImage attrs={extractAttributes(node)} />;
  },
  'qsp-action-index'() {
    return <QspActionIndex />;
  },
  'qsp-objects'(node, children) {
    const attributes = extractAttributes(node);
    return <QspObjects attrs={attributes}>{children}</QspObjects>;
  },
  'qsp-objects-list'(node) {
    return <QspObjectsList attrs={extractAttributes(node)} />;
  },
  'qsp-object-name'() {
    return <QspObjectName />;
  },
  'qsp-object-image'(node) {
    return <QspObjectImage attrs={extractAttributes(node)} />;
  },
  'qsp-object-index'() {
    return <QspObjectIndex />;
  },
  'qsp-cmd'(node, children) {
    const attributes = extractAttributes(node);
    return <QspCmd attrs={attributes}>{children}</QspCmd>;
  },
  'qsp-cmd-input'(node) {
    const attributes = extractAttributes(node);
    return <QspCmdInput attrs={attributes} />;
  },
  'qsp-view'(node, children) {
    const attributes = extractAttributes(node);
    return (
      <QspView attrs={attributes} modal={'modal' in attributes}>
        {children}
      </QspView>
    );
  },
  'qsp-view-image'(node) {
    const attributes = extractAttributes(node);
    return <QspViewImage attrs={attributes} />;
  },
  'qsp-menu'(node, children) {
    const attributes = extractAttributes(node);
    return <QspMenu attrs={attributes}>{children}</QspMenu>;
  },
  'qsp-menu-list'(node) {
    return <QspMenuList attrs={extractAttributes(node)} />;
  },
  'qsp-menu-name'() {
    return <QspMenuItemName />;
  },
  'qsp-menu-image'(node) {
    return <QspMenuItemImage attrs={extractAttributes(node)} />;
  },
  'qsp-menu-index'() {
    return <QspMenuItemIndex />;
  },
  'qsp-msg'(node, children) {
    const attributes = extractAttributes(node);
    return <QspMsg attrs={attributes}>{children}</QspMsg>;
  },
  'qsp-msg-content'(node) {
    return <QspMsgContent attrs={extractAttributes(node)} />;
  },
  'qsp-input'(node, children) {
    const attributes = extractAttributes(node);
    return <QspInput attrs={attributes}>{children}</QspInput>;
  },
  'qsp-input-content'(node) {
    return <QspInputContent attrs={extractAttributes(node)} />;
  },
  'qsp-input-tag'(node) {
    const attributes = extractAttributes(node);
    return <QspInputTag attrs={attributes} />;
  },
  'qsp-close-button'(node, children) {
    const attributes = extractAttributes(node);
    return <QspCloseButton attrs={attributes}>{children}</QspCloseButton>;
  },
  'qsp-ok-button'(node, children) {
    const attributes = extractAttributes(node);
    return <QspOkButton attrs={attributes}>{children}</QspOkButton>;
  },
  'qsp-cancel-button'(node, children) {
    const attributes = extractAttributes(node);
    return <QspCancelButton attrs={attributes}>{children}</QspCancelButton>;
  },
  'qsp-button'(node, children) {
    const action = (node.getAttribute('type') || 'credits') as GameAction;
    const attributes = extractAttributes(node);
    return (
      <QspButton action={action} attrs={attributes}>
        {children}
      </QspButton>
    );
  },
  'qsp-pause-screen-content'(node, children) {
    const attributes = extractAttributes(node);
    return <QspPauseScreenContent attrs={attributes}>{children}</QspPauseScreenContent>;
  },
  'qsp-pause-screen-credits'(node, children) {
    const attributes = extractAttributes(node);
    return <QspPauseScreenCredits attrs={attributes}>{children}</QspPauseScreenCredits>;
  },
  'qsp-pause-screen-preferences'(node, children) {
    const attributes = extractAttributes(node);
    return <QspPauseScreenPreferences attrs={attributes}>{children}</QspPauseScreenPreferences>;
  },
  'qsp-pause-screen-save'(node, children) {
    const attributes = extractAttributes(node);
    return <QspPauseScreenSave attrs={attributes}>{children}</QspPauseScreenSave>;
  },
  'qsp-pause-screen-load'(node, children) {
    const attributes = extractAttributes(node);
    return <QspPauseScreenLoad attrs={attributes}>{children}</QspPauseScreenLoad>;
  },
  'qsp-slots-list'(node) {
    return <QspSlotsList attrs={extractAttributes(node)} />;
  },
  'qsp-save-slot-index'() {
    return <QspSlotIndex />;
  },
  'qsp-save-slot-date'(_, children) {
    return <QspSlotDate>{children}</QspSlotDate>;
  },
  'qsp-variable'(node) {
    const { name, key, index } = extractAttributes(node);
    return (
      <QspVariable
        name={name as string}
        key={key as string}
        index={index ? parseInt(index as string, 10) : undefined}
      />
    );
  },
  'qsp-region'(node) {
    const { name, ...attributes } = extractAttributes(node);
    return <QspRegion name={name as string} attrs={attributes} />;
  },
  'qsp-layer'(node, children) {
    const { name, index, ...attributes } = extractAttributes(node);
    return (
      <QspLayer name={name as string} index={parseInt(index)} attrs={attributes}>
        {children}
      </QspLayer>
    );
  },
  'qsp-show'(node, children) {
    const condition = node.getAttribute('when') || '';
    return <QspShow condition={condition}>{children}</QspShow>;
  },
  'qsp-style'(node) {
    const from = node.getAttribute('from') || '';
    return <QspStyle from={from} />;
  },
  'qsp-t'(node) {
    const tkey = node.getAttribute('tkey') || '';
    return <QspT tkey={tkey} />;
  },
  a: (node, children) => {
    const { href, ...attributes } = extractAttributes(node);
    if (href) {
      if (href.toLowerCase().startsWith('exec:')) {
        return (
          <Link attrs={attributes} exec={href.substring(5)}>
            {children}
          </Link>
        );
      } else if (parseInt(href) > 0) {
        return (
          <Link attrs={attributes} act={parseInt(href)}>
            {children}
          </Link>
        );
      }
    }
    return defaultTransform(node, children);
  },
};
