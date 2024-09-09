import { parse } from 'iarna-toml-esm';

export function parseToml<T>(content: string): T {
  // fix parsing config with windows line endings
  content = content.replaceAll(/\r/gi, '\n');
  return parse(content) as unknown as T;
}
