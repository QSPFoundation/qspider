import React from 'react';
import { Node } from 'interweave';
import { A, Link } from './link';
import { Image } from './image';
import { Center } from './center';
import { Hr } from './hr';
import { Area } from './area';
import { Table, Td, Th, Tr } from './table';
import { Font, fontSizeMap } from './font';
import { H1, H2, H3, H4, H5, H6 } from './headers';
import { B, Big, I, Strike, Tt } from './format';
import { Div, P } from './blocks';

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
const attributeConverters = {
  width: (value: string) => (/^\d+$/.test(value) ? `${value}px` : value),
  height: (value: string) => (/^\d+$/.test(value) ? `${value}px` : value),
  fontSize: (value: string) => (/^[+-]?\d+$/.test(value) ? fontSizeMap[value] : value),
};

const attributesToStyle = (node: HTMLElement): Record<string, string> => {
  const style: Record<string, string> = {};
  for (const name of node.getAttributeNames()) {
    const styleName = attributeToStyle[name];
    if (styleName) {
      const value = node.getAttribute(name);
      if (attributeConverters[styleName]) {
        style[styleName] = attributeConverters[styleName](value);
      } else {
        style[styleName] = value;
      }
    }
  }
  return style;
};

const parseStyles = (styles: string | null): Record<string, string> => {
  if (!styles) return {};
  return styles
    .split(';')
    .map((style) => {
      const separaTorPosition = style.indexOf(':');
      const key = style
        .substring(0, separaTorPosition)
        .trim()
        .replace(/-./g, (c) => c.substr(1).toUpperCase());
      const value = style.substring(separaTorPosition + 1).trim();
      if (!key) return null;
      return [key, value];
    })
    .filter(Boolean)
    .reduce(
      (styleObj, style) => ({
        ...styleObj,
        [style[0]]: style[1],
      }),
      {}
    );
};

const extractStyles = (node: HTMLElement): Record<string, string> => {
  const attributeStyles = attributesToStyle(node);
  const styles = parseStyles(node.getAttribute('style'));
  return {
    ...attributeStyles,
    ...styles,
  };
};

const transformers: Record<string, (node: HTMLElement, children: Node[]) => React.ReactNode | null> = {
  font: (node, children) => {
    return (
      <Font size={node.getAttribute('size')} style={extractStyles(node)} className={node.getAttribute('class')}>
        {children}
      </Font>
    );
  },
  h1: (node, children) => {
    return (
      <H1 style={extractStyles(node)} className={node.getAttribute('class')}>
        {children}
      </H1>
    );
  },
  h2: (node, children) => {
    return (
      <H2 style={extractStyles(node)} className={node.getAttribute('class')}>
        {children}
      </H2>
    );
  },
  h3: (node, children) => {
    return (
      <H3 style={extractStyles(node)} className={node.getAttribute('class')}>
        {children}
      </H3>
    );
  },
  h4: (node, children) => {
    return (
      <H4 style={extractStyles(node)} className={node.getAttribute('class')}>
        {children}
      </H4>
    );
  },
  h5: (node, children) => {
    return (
      <H5 style={extractStyles(node)} className={node.getAttribute('class')}>
        {children}
      </H5>
    );
  },
  h6: (node, children) => {
    return (
      <H6 style={extractStyles(node)} className={node.getAttribute('class')}>
        {children}
      </H6>
    );
  },
  i: (node, children) => {
    return (
      <I style={extractStyles(node)} className={node.getAttribute('class')}>
        {children}
      </I>
    );
  },
  b: (node, children) => {
    return (
      <B style={extractStyles(node)} className={node.getAttribute('class')}>
        {children}
      </B>
    );
  },
  big: (node, children) => {
    return (
      <Big style={extractStyles(node)} className={node.getAttribute('class')}>
        {children}
      </Big>
    );
  },
  center: (node, children) => {
    return (
      <Center style={extractStyles(node)} className={node.getAttribute('class')}>
        {children}
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
    if (href && href.toLowerCase().startsWith('exec:')) {
      return (
        <Link className={className} exec={href.substr(5)} style={extractStyles(node)}>
          {children}
        </Link>
      );
    }
    return (
      <A href={href} className={className} style={extractStyles(node)}>
        {children}
      </A>
    );
  },
  div: (node, children) => {
    return (
      <Div className={node.getAttribute('class')} id={node.getAttribute('id')} style={extractStyles(node)}>
        {children}
      </Div>
    );
  },
  p: (node, children) => {
    return (
      <P className={node.getAttribute('class')} style={extractStyles(node)}>
        {children}
      </P>
    );
  },
  tt: (node, children) => {
    return (
      <Tt className={node.getAttribute('class')} style={extractStyles(node)}>
        {children}
      </Tt>
    );
  },
  strike: (node, children) => {
    return (
      <Strike className={node.getAttribute('class')} style={extractStyles(node)}>
        {children}
      </Strike>
    );
  },
  table: (node, children) => {
    return (
      <Table
        border={node.hasAttribute('border') ? Number(node.getAttribute('border')) : 0}
        cellspacing={node.hasAttribute('cellspacing') ? Number(node.getAttribute('cellspacing')) : 0}
        cellpadding={node.hasAttribute('cellpadding') ? Number(node.getAttribute('cellpadding')) : 1}
        style={extractStyles(node)}
        className={node.getAttribute('class')}
      >
        {children}
      </Table>
    );
  },
  tr: (node, children) => (
    <Tr style={extractStyles(node)} className={node.getAttribute('class')}>
      {children}
    </Tr>
  ),
  th: (node, children) => (
    <Th
      colspan={Number(node.getAttribute('colspan')) || 1}
      rowspan={Number(node.getAttribute('rowspan')) || 1}
      style={extractStyles(node)}
      className={node.getAttribute('class')}
    >
      {children}
    </Th>
  ),
  td: (node, children) => {
    return (
      <Td
        colspan={Number(node.getAttribute('colspan')) || 1}
        rowspan={Number(node.getAttribute('rowspan')) || 1}
        style={extractStyles(node)}
        className={node.getAttribute('class')}
      >
        {children}
      </Td>
    );
  },
  img: (node) => {
    if (!node.getAttribute('src')) return null;
    return (
      <Image
        src={node.getAttribute('src')}
        style={extractStyles(node)}
        className={node.getAttribute('class')}
        useMap={node.getAttribute('usemap')}
      />
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
  br: () => <br />,
};

export const transform = (node: HTMLElement, children: Node[]): React.ReactNode | null => {
  const transformer = transformers[node.tagName.toLowerCase()];
  if (transformer) {
    return transformer(node, children);
  }
  return;
};
