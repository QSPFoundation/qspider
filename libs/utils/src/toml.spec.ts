import { describe, expect, it } from 'vitest';
import { parseToml } from './toml';

interface Config {
  game: { id: string; title: string }[];
}

describe('parseToml', () => {
  const lines = ['[[game]]', 'id = "a"', 'title = "First"', '', '[[game]]', 'id = "b"', 'title = "Second"'];
  const expected: Config = {
    game: [
      { id: 'a', title: 'First' },
      { id: 'b', title: 'Second' },
    ],
  };

  it('parses a [[game]] table array', () => {
    expect(parseToml<Config>(lines.join('\n'))).toEqual(expected);
  });

  it('parses CRLF content like LF', () => {
    expect(parseToml<Config>(lines.join('\r\n'))).toEqual(expected);
  });

  it('parses lone CR content like LF', () => {
    expect(parseToml<Config>(lines.join('\r'))).toEqual(expected);
  });
});
