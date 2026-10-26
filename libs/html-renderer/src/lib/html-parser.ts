import React from 'react';
import { ParserProps, RenderNode, TransformCallback } from './html-renderer.types';
import { isHtmlElement, isTextNode } from './utils';

const domParser = new DOMParser();

export class HtmlParser {
  transform: TransformCallback;

  constructor(props: ParserProps) {
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

    return this.parseNode(doc.body);
  }

  /**
   * Loop over the nodes children and generate a
   * list of text nodes and React elements.
   */
  parseNode(parentNode: HTMLElement): RenderNode[] {
    const content: RenderNode[] = [];
    let mergedText: string[] = [];

    let key = 0;

    for (const node of parentNode.childNodes) {
      // Create React elements from HTML elements
      if (isHtmlElement(node)) {
        // Persist any previous text
        if (mergedText.length > 0) {
          content.push(mergedText.join(''));
          mergedText = [];
        }

        const transformed = this.transform(node, this.parseNode(node));

        if (transformed === null) continue;
        key++;
        content.push(React.cloneElement(transformed as React.ReactElement<unknown>, { key }));
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
}
