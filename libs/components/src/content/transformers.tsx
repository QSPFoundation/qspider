import React from 'react';
import { Node } from 'interweave';
import { A, Link } from './link';
import { Hr } from './hr';
import { Area } from './area';
import { Table } from './table';
import { Font, fontSizeMap } from './font';
import { Video } from './video';
import { Big, Strike, Tt } from './format';
import { Element } from './element';
import { Attributes } from '../hooks/attributes';

const attributeToStyle: Record<string, string> = {
  size: 'fontSize',
  color: 'color',
  face: 'fontFace',
  valign: 'verticalAlign',
  bgcolor: 'backgroundColor',
  width: 'width',
  height: 'height',
};
const imgAlignMap: Record<string, string> = {
  texttop: 'text-top',
  center: 'middle',
  abscenter: 'middle',
  bottom: 'bottom',
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
    if (node.tagName === 'IMG' && name === 'align') {
      const value = node.getAttribute(name)?.toLowerCase();
      if (value) {
        const convertedValue = imgAlignMap[value];
        if (convertedValue) {
          style.verticalAlign = convertedValue;
        }
      }
    }
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
        .replace(/-./g, (c) => c.substring(1).toUpperCase());
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
      <Font
        size={node.getAttribute('size')}
        style={extractStyles(node)}
        className={node.getAttribute('class') || undefined}
        attributes={extractAttributes(node)}
      >
        {children}
      </Font>
    );
  },
  big: (node, children) => {
    return (
      <Big
        style={extractStyles(node)}
        className={node.getAttribute('class') || undefined}
        attributes={extractAttributes(node)}
      >
        {children}
      </Big>
    );
  },
  hr: (node) => {
    return (
      <Hr width={node.getAttribute('width')} size={node.getAttribute('size')} noshade={node.hasAttribute('noshade')} />
    );
  },
  a: (node, children) => {
    const href = node.getAttribute('href');
    const className = node.getAttribute('class') || undefined;
    const attributes = extractAttributes(node);
    if (href) {
      if (href.toLowerCase().startsWith('exec:')) {
        return (
          <Link className={className} attributes={attributes} exec={href.substring(5)} style={extractStyles(node)}>
            {children}
          </Link>
        );
      } else if (parseInt(href) > 0) {
        return (
          <Link className={className} attributes={attributes} act={parseInt(href)} style={extractStyles(node)}>
            {children}
          </Link>
        );
      }
    }
    return (
      <A href={href || '#'} className={className} attributes={attributes} style={extractStyles(node)}>
        {children}
      </A>
    );
  },
  tt: (node, children) => {
    return (
      <Tt
        style={extractStyles(node)}
        className={node.getAttribute('class') || undefined}
        attributes={extractAttributes(node)}
      >
        {children}
      </Tt>
    );
  },
  strike: (node, children) => {
    return (
      <Strike
        style={extractStyles(node)}
        className={node.getAttribute('class') || undefined}
        attributes={extractAttributes(node)}
      >
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
        className={node.getAttribute('class') || undefined}
        attributes={extractAttributes(node)}
      >
        {children.filter((child) => typeof child !== 'string')}
      </Table>
    );
  },
  area: (node) => {
    return (
      <Area
        href={node.getAttribute('href') || ''}
        shape={node.getAttribute('shape') || undefined}
        coords={node.getAttribute('coords') || undefined}
        className={node.getAttribute('class') || undefined}
        attributes={extractAttributes(node)}
      ></Area>
    );
  },
  video: (node, children) => (
    <Video
      style={attributesToStyle(node)}
      className={node.getAttribute('class') || undefined}
      attributes={extractAttributes(node)}
    >
      {children}
    </Video>
  ),
};

function extractAttributes(node: HTMLElement): Attributes {
  const attributes: Attributes = {};
  Array.from(node.attributes).forEach((attr) => {
    const { name, value } = attr;
    if (name === 'class' || name === 'style') return;
    attributes[name] = value;
  });

  return attributes;
}

const voidTags = ['br', 'col', 'hr', 'img', 'source', 'track', 'wbr'];

function defaultTransform(node: HTMLElement, children: Node[]): React.ReactNode {
  const tagName = node.tagName.toLowerCase();
  const selfClose = voidTags.includes(tagName);
  const attributes = extractAttributes(node);
  const className = node.getAttribute('class') || undefined;
  return (
    <Element
      tagName={tagName}
      className={className}
      style={extractStyles(node)}
      selfClose={selfClose}
      attributes={attributes}
    >
      {children}
    </Element>
  );
}

export const transform = (node: HTMLElement, children: Node[]): React.ReactNode | null => {
  const transformer = transformers[node.tagName.toLowerCase()];
  if (transformer) {
    return transformer(node, children);
  }
  return defaultTransform(node, children);
};
