import { TransformCallback } from '@qspider/html-renderer';
import { extractAttributes } from '@qspider/game-state';
import { Font } from './classic/font';
import { Big, Strike, Tt } from './classic/format';
import { Hr } from './classic/hr';
import { Table } from './classic/table';
import { Area } from './classic/area';
import { Video } from './classic/video';
import { dockAttributes, paneAttributes, tableDimensions } from './classic/classic-attributes';
import { QspCL, QspCLDefaults, QspCLDock, QspCLLayer, QspCLPane } from './classic/classic-layout';

export const classicTransformers: Record<string, TransformCallback> = {
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
    const { border, cellspacing, cellpadding, align, valign, ...attrs } = extractAttributes(node);
    const dimensions = tableDimensions({ border, cellspacing, cellpadding });
    return (
      <Table
        align={align as React.CSSProperties['textAlign']}
        valign={valign as React.CSSProperties['verticalAlign']}
        border={dimensions.border}
        cellspacing={dimensions.cellspacing}
        cellpadding={dimensions.cellpadding}
        attrs={attrs}
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
    const { place, visibility, size } = dockAttributes(
      node.getAttribute('place'),
      node.getAttribute('visibility'),
      node.getAttribute('size'),
    );
    return (
      <QspCLDock place={place} visibility={visibility} size={size}>
        {children}
      </QspCLDock>
    );
  },
  'qsp-cl-pane': (node, children) => {
    const { visibility, proportion } = paneAttributes(node.getAttribute('visibility'), node.getAttribute('proportion'));
    return (
      <QspCLPane visibility={visibility} proportion={proportion}>
        {children}
      </QspCLPane>
    );
  },
  'qsp-cl-defaults'() {
    return <QspCLDefaults />;
  },
};
