import React from 'react';
import { Node } from 'interweave';
import { Link } from './link';
import { Image } from './image';
import { Center } from './center';

const attributeToStyle = {
  size: 'fontSize',
  color: 'color',
  face: 'fontFace',
  align: 'float',
  bgcolor: 'backgroundColor',
  cellpadding: 'borderSpacing',
  width: 'width',
  height: 'height',
  // cellspacing: '--cellspacing', // todo add
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
    return <span style={attributesToStyle(node)}>{children}</span>;
  },
  i: (_, children) => {
    return <i>{children}</i>;
  },
  b: (_, children) => {
    return <b>{children}</b>;
  },
  center: (_, children) => {
    return (
      <Center>
        <div>{children}</div>
      </Center>
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
  table: (node, children) => {
    return <table style={attributesToStyle(node)}>{children}</table>;
  },
  img: (node) => {
    return <Image src={node.getAttribute('src')} style={attributesToStyle(node)} />;
  },
};

export const transform = (node: HTMLElement, children: Node[]): React.ReactNode | null => {
  const transformer = transformers[node.tagName.toLowerCase()];
  if (transformer) {
    return transformer(node, children);
  }
  return;
};
