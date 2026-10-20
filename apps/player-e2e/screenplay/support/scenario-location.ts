// Used by the target shims (targets/*/scenario.ts): the test runners record the shim as a test's
// location, so the shims add the scenario's own file and line to its failures.

/** The `scenarios/<file>.scenario.ts:<line>` that called the shim; undefined when not found. */
export function scenarioLocation(): string | undefined {
  const limit = Error.stackTraceLimit;
  Error.stackTraceLimit = 50;
  const stack = new Error().stack ?? '';
  Error.stackTraceLimit = limit;
  return /(scenarios\/[^\s:()]+\.scenario\.ts):(\d+)/.exec(stack)?.slice(1, 3).join(':');
}

/** Runs `body`; a failure's message gets `[<location>] ` in front, keeping its type and stack. */
export async function withLocation(location: string | undefined, body: () => Promise<void>): Promise<void> {
  try {
    await body();
  } catch (error) {
    if (location && error instanceof Error) {
      const original = error.message;
      error.message = `[${location}] ${original}`;
      if (error.stack?.includes(original)) error.stack = error.stack.replace(original, error.message);
    }
    throw error;
  }
}
