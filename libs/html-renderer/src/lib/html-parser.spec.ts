import { createElement, Fragment, isValidElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { HtmlParser } from './html-parser';
import type { RenderNode, TransformCallback } from './html-renderer.types';

const element = (node: HTMLElement, children: RenderNode[]) =>
  createElement(node.tagName.toLowerCase(), null, ...children);

const keepTag: TransformCallback = (node, children) => element(node, children);

const parser = new HtmlParser({ transform: keepTag });

const html = (nodes: RenderNode[]) => renderToStaticMarkup(createElement(Fragment, null, ...nodes));

describe('HtmlParser.parse', () => {
  it('returns no nodes for empty markup', () => {
    expect(parser.parse('')).toEqual([]);
  });

  describe('line breaks', () => {
    it('turns a line feed in plain text into a br', () => {
      expect(html(parser.parse('a\nb'))).toBe('a<br/>b');
    });

    it('treats a Windows line ending as one line break', () => {
      expect(html(parser.parse('a\r\nb'))).toBe('a<br/>b');
    });

    it('caps a long run of line feeds at three breaks', () => {
      expect(html(parser.parse('a\n\n\n\n\nb'))).toBe('a<br/><br/><br/>b');
    });

    it('keeps the raw line feed when conversion is switched off', () => {
      expect(parser.parse('a\nb', false)).toEqual(['a\nb']);
    });

    it('leaves line feeds alone when the markup has a closing tag', () => {
      expect(html(parser.parse('<b>x</b>\ny'))).toBe('<b>x</b>\ny');
    });

    it('leaves line feeds alone when the markup has a self-closed tag', () => {
      expect(html(parser.parse('x<br/>\ny'))).toBe('x<br/>\ny');
    });
  });

  describe('text', () => {
    it('decodes character references into plain text', () => {
      expect(parser.parse('&lt;b&gt; &amp;')).toEqual(['<b> &']);
    });

    it('skips comments and merges the text around them', () => {
      expect(parser.parse('a<!-- c -->b')).toEqual(['ab']);
    });
  });

  describe('elements', () => {
    it('closes tags the markup left open', () => {
      expect(html(parser.parse('<b><i>MALFORMED OK'))).toBe('<b><i>MALFORMED OK</i></b>');
    });

    it('drops an element, with its children, when the transform returns null, leaving the text on each side', () => {
      const dropSpan = new HtmlParser({
        transform: (node, children) => (node.tagName === 'SPAN' ? null : element(node, children)),
      });

      const nodes = dropSpan.parse('a<span>gone</span>b');

      // The text before the element is flushed as its own node, so it is not merged with the text after it
      expect(nodes).toEqual(['a', 'b']);
      expect(html(nodes)).toBe('ab');
    });

    it('numbers sibling elements from 1 with the text kept between them', () => {
      const nodes = parser.parse('<i>1</i>t<i>2</i>');

      expect(nodes).toHaveLength(3);
      const [first, text, last] = nodes;
      expect(isValidElement(first) && first.key).toBe('1');
      expect(text).toBe('t');
      expect(isValidElement(last) && last.key).toBe('2');
    });
  });
});
