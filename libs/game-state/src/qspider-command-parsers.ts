// The pure parts of the qspider commands a game sends through `exec('qspider.<command>')` (see
// modules/qspider.qsps). No imports: the commands themselves (qspider-commands.ts) touch the engine and the UI.

export type EventArg = string | number;

export interface ParsedEvent {
  name: string;
  args?: EventArg[];
}

/** The command after `qspider.` in a `system_cmd` string, or null for a string that is not a qspider command. */
export function parseSystemCmd(cmd: string): string | null {
  if (!cmd.startsWith('qspider')) return null;
  const [, body] = cmd.split('.');
  return body;
}

/** The event arguments between the brackets of `event:name[...]`: `~text~` is a string, a bare token a number. */
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
  pushNumber(args, current);
  return args;
}

/** Pushes the bare (number) token in `chars`, if it holds anything but whitespace. */
function pushNumber(args: EventArg[], chars: string[]): void {
  const token = chars.join('').trim();
  if (token) args.push(parseFloat(token));
}

/** The `qspider-event` detail for the data of `qspider.event:<data>`: `name` or `name[args]`. */
export function parseEvent(event: string): ParsedEvent {
  const match = event.trim().match(/(.*?)(\[(.*?)\])/i);
  if (match) {
    return { name: match[1], args: parseArgs(match[3]) };
  }
  return { name: event.trim() };
}

/** The region and the direction of `qspider.scroll_region:<name>:<direction>`. */
export function parseScrollRegion(data: string): { name: string; direction: string | undefined } {
  const [name, direction] = data.split(':');
  return { name, direction };
}

/**
 * One scroll request for a panel or region: `top` scrolls to the top (-1); anything else scrolls to the
 * bottom once more (a counter that the renderer watches; an earlier `top` counts as 0).
 */
export function scrollStep(current: number | undefined, direction: string | undefined): number {
  return direction === 'top' ? -1 : Math.max(current ?? 0, 0) + 1;
}
