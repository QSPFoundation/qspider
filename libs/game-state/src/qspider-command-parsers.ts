// The pure parts of the qspider commands a game sends through `exec('qspider.<command>')` (see
// modules/qspider.qsps). No imports: the commands themselves (qspider-commands.ts) touch the engine and the UI.

export type EventArg = string | number;

export interface ParsedEvent {
  name: string;
  args?: EventArg[];
}

/**
 * The command in a `system_cmd` string: everything after the first `.` of `qspider.<command>`, so the
 * command's own dots are kept (`qspider.change_theme:my.theme`, `qspider.event:x[1.5]`). Null for a string
 * that is not a qspider command, a bare `qspider` included.
 */
export function parseSystemCmd(cmd: string): string | null {
  if (!cmd.startsWith('qspider')) return null;
  const dot = cmd.indexOf('.');
  return dot === -1 ? null : cmd.slice(dot + 1);
}

/**
 * The event arguments between the brackets of `event:name[...]`, as qspider_event writes them: `~text~` for a
 * string, the bare value for a number, separated by commas.
 *
 * - Inside `~…~` every character is text, `,` and `]` included; there is no escape for `~` itself.
 * - A closing `~` ends its argument: what follows before the next comma is a new argument
 *   (`~a~x` gives `['a', 'x']`).
 * - An unclosed `~` runs to the end and is still a string (`~12` gives `'12'`).
 * - A bare token is trimmed; empty ones are skipped. It is the number `parseFloat` reads from it, as before
 *   (`12abc` gives 12, `0x10` gives 0); only where `parseFloat` gives NaN is it kept as text (`x` gives `'x'`).
 */
export function parseArgs(input: string): EventArg[] {
  const args: EventArg[] = [];
  let is_string = false;
  let current: string[] = [];
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (char === '~') {
      if (is_string) {
        is_string = false;
        args.push(current.join(''));
        current = [];
      } else {
        is_string = true;
      }
    } else if (!is_string && char === ',') {
      // A comma right after a closing `~` ends nothing: that string is already pushed.
      pushNumber(args, current);
      current = [];
    } else {
      current.push(char);
    }
  }
  if (is_string) {
    args.push(current.join(''));
  } else {
    pushNumber(args, current);
  }
  return args;
}

/** Pushes the bare token in `chars`, if it holds anything but whitespace: a number, or the text when it is not one. */
function pushNumber(args: EventArg[], chars: string[]): void {
  const token = chars.join('').trim();
  if (!token) return;
  const value = parseFloat(token);
  args.push(Number.isNaN(value) ? token : value);
}

/**
 * The `qspider-event` detail for the data of `qspider.event:<data>` (trimmed): `name` or `name[args]`. The
 * name is everything before the first `[`; the arguments run from there to the last `]`, so a `]` inside a
 * string argument stays in it (`e[~a]b~,2]`). Text after the last `]` is ignored; a `[` with no `]` after it
 * is part of the name.
 */
export function parseEvent(event: string): ParsedEvent {
  const data = event.trim();
  const open = data.indexOf('[');
  const close = data.lastIndexOf(']');
  if (open !== -1 && close > open) {
    return { name: data.slice(0, open), args: parseArgs(data.slice(open + 1, close)) };
  }
  return { name: data };
}

/**
 * The region and the direction of `qspider.scroll_region:<name>:<direction>`. The direction is after the
 * last `:`, so a region name may hold `:` itself; with no `:` the whole is the name and there is no direction.
 */
export function parseScrollRegion(data: string): { name: string; direction: string | undefined } {
  const colon = data.lastIndexOf(':');
  if (colon === -1) return { name: data, direction: undefined };
  return { name: data.slice(0, colon), direction: data.slice(colon + 1) };
}

/**
 * One scroll request for a panel or region: `top` scrolls to the top (-1); anything else scrolls to the
 * bottom once more (a counter that the renderer watches; an earlier `top` counts as 0).
 */
export function scrollStep(current: number | undefined, direction: string | undefined): number {
  return direction === 'top' ? -1 : Math.max(current ?? 0, 0) + 1;
}
