import React from 'react';
import { Node } from 'interweave';
import { Link } from './link';
import { Image } from './image';
import { Center } from './center';
import { Big } from './big';
import { Hr } from './hr';
import { Strike } from './strike';
import { Tt } from './tt';
import { Area } from './area';
import { Table } from './table';
import { Font } from './font';

const attributeToStyle = {
  size: 'fontSize',
  color: 'color',
  face: 'fontFace',
  align: 'textAlign',
  valign: 'verticalAlign',
  bgcolor: 'backgroundColor',
  width: 'width',
  height: 'height',
};

const attributesToStyle = (node: HTMLElement): Record<string, string> => {
  const style: Record<string, string> = {};
  for (const name of node.getAttributeNames()) {
    const styleName = attributeToStyle[name];
    if (styleName) {
      style[styleName] = node.getAttribute(name);
    }
  }
  return style;
};

const transformers: Record<string, (node: HTMLElement, children: Node[]) => React.ReactNode | null> = {
  font: (node, children) => {
    return (
      <Font size={node.getAttribute('size')} style={attributesToStyle(node)}>
        {children}
      </Font>
    );
  },
  i: (_, children) => {
    return <i>{children}</i>;
  },
  b: (_, children) => {
    return <b>{children}</b>;
  },
  big: (_, children) => {
    return <Big>{children}</Big>;
  },
  center: (_, children) => {
    return (
      <Center>
        <div>{children}</div>
      </Center>
    );
  },
  hr: (node) => {
    return (
      <Hr width={node.getAttribute('width')} size={node.getAttribute('size')} noshade={node.hasAttribute('noshade')} />
    );
  },
  a: (node, children) => {
    const href = node.getAttribute('href');
    const className = node.className || '';
    if (href.toLowerCase().startsWith('exec:')) {
      return (
        <Link className={className} exec={href.substr(5)}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  },
  div: (node, children) => {
    return <div style={attributesToStyle(node)}>{children}</div>;
  },
  p: (node, children) => {
    return <p style={attributesToStyle(node)}>{children}</p>;
  },
  tt: (_, children) => {
    return <Tt>{children}</Tt>;
  },
  strike: (_, children) => {
    return <Strike>{children}</Strike>;
  },
  table: (node, children) => {
    return (
      <Table
        border={node.hasAttribute('border') ? Number(node.getAttribute('border')) : 1}
        cellspacing={Number(node.getAttribute('cellspacing'))}
        cellpadding={Number(node.getAttribute('cellpadding'))}
        style={attributesToStyle(node)}
      >
        {children}
      </Table>
    );
  },
  tr: (node, children) => <tr style={attributesToStyle(node)}>{children}</tr>,
  th: (node, children) => (
    <th
      colSpan={Number(node.getAttribute('colspan')) || 1}
      rowSpan={Number(node.getAttribute('rowspan')) || 1}
      style={attributesToStyle(node)}
    >
      {children}
    </th>
  ),
  td: (node, children) => (
    <td
      colSpan={Number(node.getAttribute('colspan')) || 1}
      rowSpan={Number(node.getAttribute('rowspan')) || 1}
      style={attributesToStyle(node)}
    >
      {children}
    </td>
  ),
  img: (node) => {
    return (
      <Image src={node.getAttribute('src')} style={attributesToStyle(node)} useMap={node.getAttribute('usemap')} />
    );
  },
  map: (node, children) => {
    return <map name={node.getAttribute('name')}>{children}</map>;
  },
  area: (node) => {
    return (
      <Area
        href={node.getAttribute('href')}
        shape={node.getAttribute('shape')}
        coords={node.getAttribute('coords')}
      ></Area>
    );
  },
};

export const transform = (node: HTMLElement, children: Node[]): React.ReactNode | null => {
  const transformer = transformers[node.tagName.toLowerCase()];
  if (transformer) {
    return transformer(node, children);
  }
  return;
};
