import safeParser from 'postcss-safe-parser';
import valueParser from 'postcss-value-parser';
import postcss, { AcceptedPlugin, Parser } from 'postcss';
import { fetchProxyFallback, resolvePath } from '@qspider/utils';
import { getResource } from './resources';
import { isExternalPath } from './utils';

export async function prepareCss(content: string, rootPath: string): Promise<string> {
  const additionalStyles: string[] = [];
  const processed = new WeakSet();
  const plugin = (): AcceptedPlugin => ({
    AtRule: {
      async import(rule): Promise<void> {
        if (processed.has(rule)) return;
        processed.add(rule);
        const parsed = valueParser(rule.params);
        const urlPart = parsed.nodes[0];
        let url;
        if (urlPart.type === 'function' && urlPart.value === 'url') {
          url = isExternalPath(urlPart.nodes[0].value)
            ? urlPart.nodes[0].value
            : resolvePath(rootPath, urlPart.nodes[0].value);
        } else if (urlPart.type === 'string') {
          url = isExternalPath(urlPart.value) ? urlPart.value : resolvePath(rootPath, urlPart.value);
        }
        if (url) {
          const response = await fetchProxyFallback(getResource(url).url);
          if (response.ok) {
            const text = await response.text();
            additionalStyles.push(await prepareCss(text, url));
          }
        }
        rule.remove();
      },
    },
    async Declaration(declaration): Promise<void> {
      if (processed.has(declaration)) return;
      processed.add(declaration);
      if (declaration.value.toLowerCase().includes('url(')) {
        const parsed = valueParser(declaration.value);
        parsed.walk((node) => {
          if (
            node.type === 'function' &&
            node.value === 'url' &&
            node.nodes[0] &&
            !isExternalPath(node.nodes[0].value)
          ) {
            node.nodes[0].value = getResource(resolvePath(rootPath, node.nodes[0].value)).url;
          }
        });
        declaration.value = parsed.toString();
      }
    },
    postcssPlugin: 'ok',
  });
  const result = await postcss([plugin()])
    .process(content, {
      from: '',
      map: false,
      parser: safeParser as unknown as Parser,
    })
    .catch((e) => console.error(e));
  return additionalStyles.join('') + (result?.css ?? '');
}

export function processStyles(content: string): Record<string, string | number> {
  const result: Record<string, string | number> = {};
  const processed = new WeakSet();
  const plugin = (): AcceptedPlugin => ({
    Declaration(declaration): void {
      if (processed.has(declaration)) return;
      processed.add(declaration);
      const { prop, value } = declaration;
      const name = prop.replace(/^-ms-/, 'ms-').replace(/-./g, (c) => c.substring(1).toUpperCase());
      let preparedValue: string | number = value;
      if (value.toLowerCase().includes('url(')) {
        const parsed = valueParser(value);
        parsed.walk((node) => {
          if (node.type === 'function' && node.value === 'url' && node.nodes[0]) {
            node.nodes[0].value = getResource(node.nodes[0].value).url || 'not-found.png';
          }
        });
        preparedValue = parsed.toString();
      } else if (name === 'backgroundImage') {
        preparedValue = `url("${getResource(value).url}")`;
      } else if (/^[+-]?\d+(\.\d+)?$/.test(value)) {
        preparedValue = parseFloat(value);
      }
      result[name] = preparedValue;
    },
    postcssPlugin: 'ok',
  });
  postcss([plugin()])
    .process(content, {
      from: '',
      map: false,
      parser: safeParser as unknown as Parser,
    })
    .catch((e) => console.error(e));
  return result;
}
