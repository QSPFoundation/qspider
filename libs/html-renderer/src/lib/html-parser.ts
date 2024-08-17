import React from 'react';
import {
  ALLOWED_TAG_LIST,
  ATTRIBUTES,
  ATTRIBUTES_TO_PROPS,
  BANNED_TAG_LIST,
  FILTER_CAST_BOOL,
  FILTER_CAST_NUMBER,
  FILTER_DENY,
  FILTER_NO_CAST,
  TAGS,
} from './constants';
import { Element } from './Element';
import {
  Attributes,
  AttributeValue,
  ElementProps,
  NodeConfig,
  ParserProps,
  RenderNode,
  TransformCallback,
} from './html-renderer.types';
import { isHtmlElement, isTextNode } from './utils';

const ALLOWED_ATTRS = /^(aria-|data-|\w+:)/iu;

const domParser = new DOMParser();

export class HtmlParser {
  allowed: Set<string>;
  banned: Set<string>;
  blocked: Set<string>;

  transform?: TransformCallback;

  constructor(props: ParserProps = {}) {
    this.allowed = new Set(props.allowList ?? ALLOWED_TAG_LIST);
    this.banned = new Set(BANNED_TAG_LIST);
    this.blocked = new Set(props.blockList);
    this.transform = props.transform;
  }

  /**
   * Parse the markup by injecting it into a detached document,
   * while looping over all child nodes and generating an
   * array to interpolate into JSX.
   */
  parse(markup: string, convertLineBreaks = true): RenderNode[] {
    if (!markup) {
      return [];
    }
    const doc = domParser.parseFromString(convertLineBreaks ? this.convertLineBreaks(markup) : markup, 'text/html');
    if (!doc.body) {
      return [];
    }

    return this.parseNode(doc.body, this.getTagConfig(doc.body.nodeName.toLowerCase()));
  }

  /**
   * Loop over the nodes children and generate a
   * list of text nodes and React elements.
   */
  parseNode(parentNode: HTMLElement, parentConfig: NodeConfig): RenderNode[] {
    const content: RenderNode[] = [];
    let mergedText: string[] = [];

    let key = 0;

    for (const node of parentNode.childNodes) {
      // Create React elements from HTML elements
      if (isHtmlElement(node)) {
        const tagName = node.nodeName.toLowerCase();
        const config = this.getTagConfig(tagName);

        // Persist any previous text
        if (mergedText.length > 0) {
          content.push(mergedText.join(''));
          mergedText = [];
        }
        // Apply transformation second
        let children;

        if (this.transform) {
          // Must occur after key is set
          children = this.parseNode(node, config);

          const transformed = this.transform(node, children, config);

          if (transformed === null) continue;
          if (typeof transformed !== 'undefined') {
            key++;
            content.push(React.cloneElement(transformed as React.ReactElement<unknown>, { key }));

            continue;
          }
        }

        // Never allow these tags (except via a transformer)
        if (this.banned.has(tagName)) continue;

        // Only render when the following criteria is met:
        //  - HTML has not been disabled
        //  - Tag is allowed
        //  - Child is valid within the parent
        if (this.isTagAllowed(tagName) && this.canRenderChild(parentConfig, config)) {
          // Build the props as it makes it easier to test
          const attributes = this.extractAttributes(node);
          const elementProps: ElementProps = {
            tagName,
          };

          if (attributes) {
            elementProps.attributes = attributes;
          }

          if (config.void) {
            elementProps.selfClose = config.void;
          }

          ++key;
          content.push(
            React.createElement(Element, { ...elementProps, key }, children ?? this.parseNode(node, config)),
          );

          // Render the children of the current element only.
          // Important: If the current element is not allowed,
          // use the parent element for the next scope.
        } else {
          content.push(...this.parseNode(node, config.tagName ? config : parentConfig));
        }
      } else if (isTextNode(node)) {
        const text = node.textContent;
        if (text) mergedText.push(text);
      }
    }

    if (mergedText.length > 0) {
      content.push(mergedText.join(''));
    }
    return content;
  }

  /**
   * Return configuration for a specific tag.
   */
  getTagConfig(tagName: string): NodeConfig {
    const common = {
      children: [],
      content: 0,
      invalid: [],
      parent: [],
      self: true,
      tagName: '',
      type: 0,
      void: false,
    };

    // Only spread when a tag config exists,
    // otherwise we use the empty `tagName`
    // for parent config inheritance.
    if (TAGS[tagName]) {
      return {
        ...common,
        ...TAGS[tagName],
        tagName,
      };
    }

    return common;
  }

  /**
   * Convert line breaks in a string to HTML `<br/>` tags.
   * If the string contains HTML, we should not convert anything,
   * as line breaks should be handled by `<br/>`s in the markup itself.
   */
  convertLineBreaks(markup: string): string {
    if (markup.match(/<((?:\/[ a-z]+)|(?:[ a-z]+\/))>/gi)) {
      return markup;
    }

    // Replace carriage returns
    let nextMarkup = markup.replace(/\r\n/g, '\n');
    // Replace long line feeds
    nextMarkup = nextMarkup.replace(/\n{3,}/g, '\n\n\n');
    // Replace line feeds with `<br/>`s
    nextMarkup = nextMarkup.replace(/\n/g, '<br/>');

    return nextMarkup;
  }

  /**
   * Determine whether the child can be rendered within the parent.
   */
  canRenderChild(parentConfig: NodeConfig, childConfig: NodeConfig): boolean {
    if (!parentConfig.tagName || !childConfig.tagName) {
      return false;
    }

    // No children
    if (parentConfig.void) {
      return false;
    }

    // Valid children
    if (parentConfig.children.length > 0) {
      return parentConfig.children.includes(childConfig.tagName);
    }

    if (parentConfig.invalid.length > 0 && parentConfig.invalid.includes(childConfig.tagName)) {
      return false;
    }

    // Valid parent
    if (childConfig.parent.length > 0) {
      return childConfig.parent.includes(parentConfig.tagName);
    }

    // Self nesting
    if (!parentConfig.self && parentConfig.tagName === childConfig.tagName) {
      return false;
    }

    // Content category type
    return Boolean(parentConfig && parentConfig.content & childConfig.type);
  }

  /**
   * Convert an elements attribute map to an object map.
   * Returns null if no attributes are defined.
   */
  extractAttributes(node: HTMLElement): Attributes | null {
    const attributes: Attributes = {};
    let count = 0;

    if (!isHtmlElement(node) || !node.attributes) {
      return null;
    }

    for (const attr of node.attributes) {
      const { name, value } = attr;
      const newName = name.toLowerCase();
      const filter = ATTRIBUTES[newName] || ATTRIBUTES[name];

      // Verify the node is safe from attacks
      if (!this.isSafe(node)) continue;

      // Do not allow denied attributes, excluding ARIA attributes
      // Do not allow events or XSS injections
      if (
        !newName.match(ALLOWED_ATTRS) &&
        (!filter ||
          filter === FILTER_DENY ||
          newName.startsWith('on') ||
          value.replace(/(\s|\0|&#x0([9AD]);)/, '').match(/(javascript|vbscript|livescript|xss):/i))
      ) {
        continue;
      }

      // Apply attribute filters
      let newValue: AttributeValue = newName === 'style' ? this.extractStyleAttribute(node) : value;

      // Cast to boolean
      if (filter === FILTER_CAST_BOOL) {
        newValue = true;

        // Cast to number
      } else if (filter === FILTER_CAST_NUMBER) {
        newValue = Number.parseFloat(String(newValue));

        // Cast to string
      } else if (filter !== FILTER_NO_CAST) {
        newValue = String(newValue);
      }

      attributes[ATTRIBUTES_TO_PROPS[newName] || newName] = newValue as AttributeValue;
      count += 1;
    }

    if (count === 0) {
      return null;
    }

    return attributes;
  }

  /**
   * Extract the style attribute as an object and remove values that allow for attack vectors.
   */
  extractStyleAttribute(node: HTMLElement): object {
    const styles: Record<string, number | string> = {};

    Array.from(node.style).forEach((key) => {
      const value = node.style[key as keyof CSSStyleDeclaration];

      if (typeof value === 'string' || typeof value === 'number') {
        styles[key.replace(/-([a-z])/g, (match, letter) => String(letter).toUpperCase())] = value;
      }
    });

    return styles;
  }

  /**
   * Verify that a node is safe from XSS and injection attacks.
   */
  isSafe(node: HTMLElement): boolean {
    // URLs should only support HTTP, email and phone numbers
    if (typeof HTMLAnchorElement !== 'undefined' && node instanceof HTMLAnchorElement) {
      const href = node.getAttribute('href');

      // Fragment protocols start with about:
      // So let's just allow them
      if (href?.startsWith('#')) {
        return true;
      }

      const protocol = node.protocol.toLowerCase();

      return (
        protocol === ':' ||
        protocol === 'http:' ||
        protocol === 'https:' ||
        protocol === 'mailto:' ||
        protocol === 'tel:'
      );
    }

    return true;
  }

  /**
   * Verify that an HTML tag is allowed to render.
   */
  isTagAllowed(tagName: string): boolean {
    if (this.banned.has(tagName) || this.blocked.has(tagName)) {
      return false;
    }

    return true;
  }
}
