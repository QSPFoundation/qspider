import React from 'react';
import { Node } from 'interweave';
import { A, Link } from './link';
import { Image } from './image';
import { Center } from './center';
import { Hr } from './hr';
import { Area } from './area';
import { Table, Td, Th, Tr } from './table';
import { Font, fontSizeMap } from './font';
import { Source } from './source';
import { Video } from './video';
import { H1, H2, H3, H4, H5, H6 } from './headers';
import { B, Big, I, Strike, Tt } from './format';
import { Div, P } from './blocks';

const attributeToStyle: Record<string, string> = {
  size: 'fontSize',
  color: 'color',
  face: 'fontFace',
  align: 'textAlign',
  valign: 'verticalAlign',
  bgcolor: 'backgroundColor',
  width: 'width',
  height: 'height',
};
const attributeConverters: Record<string, (value: string) => string> = {
  width: (value: string): string => (/^\d+$/.test(value) ? `${value}px` : value),
  height: (value: string): string => (/^\d+$/.test(value) ? `${value}px` : value),
  fontSize: (value: string): string => (/^[+-]?\d+$/.test(value) ? fontSizeMap[value] : value),
};

const attributesToStyle = (node: HTMLElement): Record<string, string> => {
  const style: Record<string, string> = {};
  for (const name of node.getAttributeNames()) {
    const styleName = attributeToStyle[name];
    if (styleName) {
      const value = node.getAttribute(name);
      if (!value) continue;
      if (attributeConverters[styleName]) {
        style[styleName] = attributeConverters[styleName](value);
      } else {
        style[styleName] = value;
      }
    }
  }
  if (style.textAlign) {
    style['--text-align'] = style.textAlign;
  }
  return style;
};

const numericKeys = ['width', 'height', 'left', 'right', 'top', 'bottom'];

const parseStyles = (styles: string | null): Record<string, string> => {
  if (!styles) return {};
  return styles
    .split(';')
    .map((style) => {
      const separatorPosition = style.indexOf(':');
      const key = style
        .substring(0, separatorPosition)
        .trim()
        .replace(/-./g, (c) => c.substr(1).toUpperCase());
      let value = style.substring(separatorPosition + 1).trim();
      if (!key) return null;
      if (numericKeys.includes(key) && /^[+-]?\d+$/.test(value)) {
        value = `${value}px`;
      }
      return [key, value];
    })
    .filter(Boolean)
    .reduce(
      (styleObj, style) => ({
        ...styleObj,
        ...(style ? { [style[0]]: style[1] } : {}),
      }),
      {} as Record<string, string>
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
      <Font size={node.getAttribute('size')} style={extractStyles(node)} className={node.getAttribute('class') || ''}>
        {children}
      </Font>
    );
  },
  h1: (node, children) => {
    return (
      <H1 style={extractStyles(node)} className={node.getAttribute('class') || ''}>
        {children}
      </H1>
    );
  },
  h2: (node, children) => {
    return (
      <H2 style={extractStyles(node)} className={node.getAttribute('class') || ''}>
        {children}
      </H2>
    );
  },
  h3: (node, children) => {
    return (
      <H3 style={extractStyles(node)} className={node.getAttribute('class') || ''}>
        {children}
      </H3>
    );
  },
  h4: (node, children) => {
    return (
      <H4 style={extractStyles(node)} className={node.getAttribute('class') || ''}>
        {children}
      </H4>
    );
  },
  h5: (node, children) => {
    return (
      <H5 style={extractStyles(node)} className={node.getAttribute('class') || ''}>
        {children}
      </H5>
    );
  },
  h6: (node, children) => {
    return (
      <H6 style={extractStyles(node)} className={node.getAttribute('class') || ''}>
        {children}
      </H6>
    );
  },
  i: (node, children) => {
    return (
      <I style={extractStyles(node)} className={node.getAttribute('class') || ''}>
        {children}
      </I>
    );
  },
  b: (node, children) => {
    return (
      <B style={extractStyles(node)} className={node.getAttribute('class') || ''}>
        {children}
      </B>
    );
  },
  big: (node, children) => {
    return (
      <Big style={extractStyles(node)} className={node.getAttribute('class') || ''}>
        {children}
      </Big>
    );
  },
  center: (node, children) => {
    return (
      <Center style={extractStyles(node)} className={node.getAttribute('class') || ''}>
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
    if (href) {
      if (href.toLowerCase().startsWith('exec:')) {
        return (
          <Link className={className} exec={href.substr(5)} style={extractStyles(node)}>
            {children}
          </Link>
        );
      } else if (parseInt(href) > 0) {
        return (
          <Link className={className} act={parseInt(href)} style={extractStyles(node)}>
            {children}
          </Link>
        );
      }
    }
    return (
      <A href={href || '#'} className={className} style={extractStyles(node)}>
        {children}
      </A>
    );
  },
  div: (node, children) => {
    return (
      <Div
        className={node.getAttribute('class') || ''}
        id={node.getAttribute('id') || undefined}
        style={extractStyles(node)}
      >
        {children}
      </Div>
    );
  },
  p: (node, children) => {
    return (
      <P className={node.getAttribute('class') || ''} style={extractStyles(node)}>
        {children}
      </P>
    );
  },
  tt: (node, children) => {
    return (
      <Tt className={node.getAttribute('class') || ''} style={extractStyles(node)}>
        {children}
      </Tt>
    );
  },
  strike: (node, children) => {
    return (
      <Strike className={node.getAttribute('class') || ''} style={extractStyles(node)}>
        {children}
      </Strike>
    );
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
        style={extractStyles(node)}
        className={node.getAttribute('class') || ''}
      >
        {children.filter((child) => typeof child !== 'string')}
      </Table>
    );
  },
  tr: (node, children) => (
    <Tr style={extractStyles(node)} className={node.getAttribute('class') || ''}>
      {children}
    </Tr>
  ),
  th: (node, children) => (
    <Th
      colspan={Number(node.getAttribute('colspan')) || 1}
      rowspan={Number(node.getAttribute('rowspan')) || 1}
      style={extractStyles(node)}
      className={node.getAttribute('class') || ''}
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
        className={node.getAttribute('class') || ''}
      >
        {children}
      </Td>
    );
  },
  img: (node) => {
    const src = node.getAttribute('src');
    if (!src) return null;
    return (
      <Image
        src={src}
        style={extractStyles(node)}
        className={node.getAttribute('class') || ''}
        useMap={node.getAttribute('usemap') || undefined}
      />
    );
  },
  map: (node, children) => {
    return <map name={node.getAttribute('name') || ''}>{children}</map>;
  },
  area: (node) => {
    return (
      <Area
        href={node.getAttribute('href') || ''}
        shape={node.getAttribute('shape') || undefined}
        coords={node.getAttribute('coords') || undefined}
      ></Area>
    );
  },
  br: () => <br />,
  video: (node, children) => (
    <Video
      className={node.getAttribute('class') || ''}
      src={node.getAttribute('src') || undefined}
      style={attributesToStyle(node)}
      poster={node.getAttribute('poster') || undefined}
    >
      {children}
    </Video>
  ),
  source: (node) => (
    <Source
      src={node.getAttribute('src') || undefined}
      type={node.getAttribute('type') || undefined}
      media={node.getAttribute('media') || undefined}
    />
  ),
};

export const transform = (node: HTMLElement, children: Node[]): React.ReactNode | null => {
  const transformer = transformers[node.tagName.toLowerCase()];
  if (transformer) {
    return transformer(node, children);
  }
  return;
};