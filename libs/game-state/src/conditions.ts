export const conditionAttributes = [
  'equals',
  'not-equals',
  'is',
  'is-not',
  'contains',
  'not-contains',
  'greater',
  'less',
  'greater-or-equal',
  'less-or-equal',
];

function isNumeric(value: string | number): boolean {
  return typeof value === 'number' || (value.trim() !== '' && !Number.isNaN(Number(value)));
}

/** Compares as numbers when both sides are numeric, otherwise as strings. */
function compare(value: string | number, toCompare: string): number {
  if (isNumeric(value) && isNumeric(toCompare)) return Number(value) - Number(toCompare);
  const left = String(value);
  return left < toCompare ? -1 : left > toCompare ? 1 : 0;
}

export function checkCondition(value: string | number, condition: [string, string]): boolean {
  const [op, toCompare] = condition;
  switch (op) {
    case 'equals':
    case 'is':
      return String(value) === String(toCompare);
    case 'not-equals':
    case 'is-not':
      return String(value) !== String(toCompare);
    case 'contains':
      return String(value).includes(toCompare);
    case 'not-contains':
      return !String(value).includes(toCompare);
    case 'greater':
      return compare(value, toCompare) > 0;
    case 'less':
      return compare(value, toCompare) < 0;
    case 'greater-or-equal':
      return compare(value, toCompare) >= 0;
    case 'less-or-equal':
      return compare(value, toCompare) <= 0;
  }
  return false;
}
