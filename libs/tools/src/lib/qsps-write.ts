import { QspAction, QspLocation } from './contracts';

function escapeQspString(input: string): string {
  return input.replace(/'/g, "''");
}

function convertDescription(desc: string): string {
  if (!desc) return '';
  const lines = desc.split(/\r?\n/);
  const last = lines.pop();
  return (
    lines.map((line) => `*pl '${escapeQspString(line)}'`).join('\r\n') +
    (lines.length ? '\r\n' : '') +
    (last ? `*p '${escapeQspString(last)}'\r\n` : '')
  );
}

function convertAction(action: QspAction): string {
  return `act '${escapeQspString(action.action_name)}'${
    action.image ? `, '${escapeQspString(action.image)}'` : ''
  }:\r\n  ${action.action_code.split(/\r?\n/).join('\r\n  ')}\r\nend`;
}

function convertActions(actions: QspAction[]): string {
  if (!actions.length) return '';
  return actions.map(convertAction).join('\r\n') + '\r\n';
}

function convertLocation(location: QspLocation): string {
  return `# ${location.name}\r\n${convertDescription(location.desc)}${convertActions(location.actions)}${
    location.code
  }\r\n--- ${location.name} ---------------------------------\r\n`;
}

export function writeQsps(locations: QspLocation[]): string {
  return locations.map(convertLocation).join('\r\n');
}
