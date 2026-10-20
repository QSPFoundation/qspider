import { describe, expect, it } from 'vitest';
import { withLocation } from './scenario-location';

const failWith = (message: string) => async () => {
  throw new Error(message);
};

describe('withLocation', () => {
  it('prefixes the message and the stack with the location', async () => {
    const error = await withLocation('scenarios/x.scenario.ts:3', failWith('boom')).catch((e: Error) => e);
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe('[scenarios/x.scenario.ts:3] boom');
    expect((error as Error).stack).toContain('Error: [scenarios/x.scenario.ts:3] boom');
  });

  it('keeps $ sequences in the message literal', async () => {
    const error = (await withLocation('scenarios/x.scenario.ts:3', failWith('cost $& and $1')).catch(
      (e: Error) => e,
    )) as Error;
    expect(error.message).toBe('[scenarios/x.scenario.ts:3] cost $& and $1');
    expect(error.stack).toContain('Error: [scenarios/x.scenario.ts:3] cost $& and $1\n');
  });

  it('leaves the error alone without a location', async () => {
    const error = (await withLocation(undefined, failWith('boom')).catch((e: Error) => e)) as Error;
    expect(error.message).toBe('boom');
  });
});
