import { Node } from 'interweave';
import { extractAttributes } from '@qspider/game-state';
import { QspActions, QspActionsList, QspActionName, QspActionImage, QspActionIndex } from '../theme-core/actions';
import { QspCloseButton, QspOkButton, QspCancelButton } from '../theme-core/buttons';
import { QspCmd, QspCmdInput } from '../theme-core/cmd';
import { QspInput, QspInputContent, QspInputTag } from '../theme-core/input';
import { QspMenu, QspMenuList, QspMenuItemName, QspMenuItemImage, QspMenuItemIndex } from '../theme-core/menu';
import { QspMsg, QspMsgContent } from '../theme-core/msg';
import { QspObjects, QspObjectsList, QspObjectName, QspObjectImage, QspObjectIndex } from '../theme-core/objects';
import {
  QspPauseScreenContent,
  QspSlotsList,
  QspSlotIndex,
  QspSlotDate,
  QspPauseScreen,
  QspPauseScreenPanel,
  QspSlot,
} from '../theme-core/pause-screen';
import { isScrollType, QspScrollable, ScrollType } from '../theme-core/scrollable';
import { QspStats, QspStatsContent } from '../theme-core/stats';
import { QspView, QspViewImage } from '../theme-core/view';
import { Link } from './base/link';
import { Element } from '../content/element';
import { QspT } from '../qsp-t';
import { QspMain, QspMainContent } from '../theme-core/main';
import { HtmlSelect } from '../theme-core/html/select';
import { HtmlTextarea } from '../theme-core/html/textarea';
import { HtmlInput } from '../theme-core/html/input';
import { HtmlForm } from '../theme-core/html/form';
import { QspLayer, QspRegion, QspShow, QspStyle, QspVariable } from '../theme-core/qspider';

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
    const preparedScroll: ScrollType | undefined = isScrollType(scroll) ? scroll : undefined;
    return (
      <QspScrollable scroll={preparedScroll} attrs={attributes}>
        {children}
      </QspScrollable>
    );
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
  'qsp-action-name'(node) {
    return <QspActionName attrs={extractAttributes(node)} />;
  },
  'qsp-action-image'(node) {
    return <QspActionImage attrs={extractAttributes(node)} />;
  },
  'qsp-action-index'(node) {
    return <QspActionIndex attrs={extractAttributes(node)} />;
  },
  'qsp-objects'(node, children) {
    const attributes = extractAttributes(node);
    return <QspObjects attrs={attributes}>{children}</QspObjects>;
  },
  'qsp-objects-list'(node) {
    return <QspObjectsList attrs={extractAttributes(node)} />;
  },
  'qsp-object-name'(node) {
    return <QspObjectName attrs={extractAttributes(node)} />;
  },
  'qsp-object-image'(node) {
    return <QspObjectImage attrs={extractAttributes(node)} />;
  },
  'qsp-object-index'(node) {
    return <QspObjectIndex attrs={extractAttributes(node)} />;
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
    const {
      'show-as': showAs,
      'show-at': showAt,
      'offset-x': offsetX,
      'offset-y': offsetY,
      ...attributes
    } = extractAttributes(node);

    return (
      <QspMenu
        showAs={showAs as 'mouse'}
        showAt={showAt}
        offsetX={offsetX ? parseInt(offsetX, 10) : 0}
        offsetY={offsetY ? parseInt(offsetY, 10) : 0}
        attrs={attributes}
      >
        {children}
      </QspMenu>
    );
  },
  'qsp-menu-list'(node) {
    return <QspMenuList attrs={extractAttributes(node)} />;
  },
  'qsp-menu-name'(node) {
    return <QspMenuItemName attrs={extractAttributes(node)} />;
  },
  'qsp-menu-image'(node) {
    return <QspMenuItemImage attrs={extractAttributes(node)} />;
  },
  'qsp-menu-index'(node) {
    return <QspMenuItemIndex attrs={extractAttributes(node)} />;
  },
  'qsp-msg'(node, children) {
    return <QspMsg attrs={extractAttributes(node)}>{children}</QspMsg>;
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
  'qsp-pause-screen'(node, children) {
    const attributes = extractAttributes(node);
    return <QspPauseScreen attrs={attributes}>{children}</QspPauseScreen>;
  },
  'qsp-pause-screen-content'(node, children) {
    const attributes = extractAttributes(node);
    return <QspPauseScreenContent attrs={attributes}>{children}</QspPauseScreenContent>;
  },
  'qsp-pause-screen-panel'(node, children) {
    const { name, ...attributes } = extractAttributes(node);
    if (!name) return null;
    return (
      <QspPauseScreenPanel name={name} attrs={attributes}>
        {children}
      </QspPauseScreenPanel>
    );
  },
  'qsp-slots-list'(node, children) {
    return <QspSlotsList attrs={extractAttributes(node)}>{children}</QspSlotsList>;
  },
  'qsp-save-slot'(node, children) {
    return (
      <QspSlot attrs={extractAttributes(node)} index={-1}>
        {children}
      </QspSlot>
    );
  },
  'qsp-slot-index'(node) {
    return <QspSlotIndex attrs={extractAttributes(node)} />;
  },
  'qsp-slot-date'(node, children) {
    return <QspSlotDate attrs={extractAttributes(node)}>{children}</QspSlotDate>;
  },
  'qsp-variable'(node) {
    const { name, key, index } = extractAttributes(node);
    return (
      <QspVariable
        name={name as string}
        vkey={key as string}
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
    const children = node.innerText;
    return <QspT>{children}</QspT>;
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
  select(node, children) {
    return <HtmlSelect attrs={extractAttributes(node)}>{children}</HtmlSelect>;
  },
  textarea(node) {
    const attrs = extractAttributes(node);
    attrs['value'] = node.innerText;
    return <HtmlTextarea attrs={attrs}></HtmlTextarea>;
  },
  input(node) {
    return <HtmlInput attrs={extractAttributes(node)} />;
  },
  form(node, children) {
    return <HtmlForm attrs={extractAttributes(node)}>{children}</HtmlForm>;
  },
};
