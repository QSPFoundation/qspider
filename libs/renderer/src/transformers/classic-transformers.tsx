import { Node } from 'interweave';
import { DockPlace, extractAttributes } from '@qspider/game-state';
import { Font } from './classic/font';
import { Big, Strike, Tt } from './classic/format';
import { Hr } from './classic/hr';
import { Table } from './classic/table';
import { Area } from './classic/area';
import { Video } from './classic/video';
import { QspCL, QspCLDefaults, QspCLDock, QspCLLayer, QspCLPane } from './classic/classic-layout';

export const classicTransformers: Record<string, (node: HTMLElement, children: Node[]) => React.ReactNode | null> = {
  font: (node, children) => {
    return (
      <Font size={node.getAttribute('size')} attrs={extractAttributes(node)}>
        {children}
      </Font>
    );
  },
  big: (node, children) => {
    return <Big attrs={extractAttributes(node)}>{children}</Big>;
  },
  hr: (node) => {
    const { width, size, noshade, ...attributes } = extractAttributes(node);
    return <Hr attrs={attributes} width={width} size={size} noshade={Boolean(noshade)} />;
  },
  tt: (node, children) => {
    return <Tt attrs={extractAttributes(node)}>{children}</Tt>;
  },
  strike: (node, children) => {
    return <Strike attrs={extractAttributes(node)}>{children}</Strike>;
  },
  tbody: (_node, children) => {
    return <tbody>{children.filter((child) => typeof child !== 'string')}</tbody>;
  },
  table: (node, children) => {
    return (
      <Table
        border={node.hasAttribute('border') ? Number(node.getAttribute('border')) : 0}
        cellspacing={node.hasAttribute('cellspacing') ? Number(node.getAttribute('cellspacing')) : 0}
        cellpadding={node.hasAttribute('cellpadding') ? Number(node.getAttribute('cellpadding')) : 1}
        attrs={extractAttributes(node)}
      >
        {children.filter((child) => typeof child !== 'string')}
      </Table>
    );
  },
  area: (node) => {
    const { href, ...attributes } = extractAttributes(node);
    return <Area href={href || ''} attrs={attributes}></Area>;
  },
  video: (node, children) => <Video attrs={extractAttributes(node)}>{children}</Video>,
  'qsp-cl': (_, children) => {
    return <QspCL>{children}</QspCL>;
  },
  'qsp-cl-layer': (_, children) => {
    return <QspCLLayer>{children}</QspCLLayer>;
  },
  'qsp-cl-dock': (node, children) => {
    const place: DockPlace = (node.getAttribute('place') || 'center') as DockPlace;
    const visibility = node.getAttribute('visibility');
    const size = node.getAttribute('size') ?? 0;
    return (
      <QspCLDock place={place} visibility={visibility} size={Number(size)}>
        {children}
      </QspCLDock>
    );
  },
  'qsp-cl-pane': (node, children) => {
    const proportion = node.getAttribute('proportion') ?? 1;
    const visibility = node.getAttribute('visibility');
    return (
      <QspCLPane visibility={visibility} proportion={Number(proportion)}>
        {children}
      </QspCLPane>
    );
  },
  'qsp-cl-defaults'() {
    return <QspCLDefaults />;
  },
};
