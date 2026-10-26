import { describe, expect, it } from 'vitest';
import { configXmlSize } from './game-config';

/** The way runGame reads an aero game's config.xml. */
function sizeOf(xml: string): ReturnType<typeof configXmlSize> {
  return configXmlSize(new DOMParser().parseFromString(xml, 'application/xml'));
}

describe('configXmlSize', () => {
  it('reads the width and height of the game element', () => {
    expect(sizeOf('<?xml version="1.0"?><config><game width="1024" height="700" title="Demo"/></config>')).toEqual({
      width: 1024,
      height: 700,
    });
  });

  it('falls back to 800 by 600 for a missing width and height', () => {
    expect(sizeOf('<config><game title="Demo"/></config>')).toEqual({ width: 800, height: 600 });
    expect(sizeOf('<config><game width="" height=""/></config>')).toEqual({ width: 800, height: 600 });
  });

  it('falls back to 800 by 600 for auto', () => {
    expect(sizeOf('<config><game width="auto" height="auto"/></config>')).toEqual({ width: 800, height: 600 });
  });

  it('falls back for one side only', () => {
    expect(sizeOf('<config><game width="1280" height="auto"/></config>')).toEqual({ width: 1280, height: 600 });
  });

  it('answers nothing when there is no game element', () => {
    expect(sizeOf('<config><window width="1"/></config>')).toBeNull();
  });
});
