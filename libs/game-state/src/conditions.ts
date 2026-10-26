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

function isNumeric(value: string): boolean {
  return value.trim() !== '' && !Number.isNaN(Number(value));
}

/** A number compares numerically against `Number(toCompare)`; two numeric strings compare as numbers, any other strings as text. */
function compare(value: string | number, toCompare: string): number {
  if (typeof value === 'number') {
    const right = Number(toCompare);
    return value > right ? 1 : value < right ? -1 : value === right ? 0 : NaN;
  }
  if (isNumeric(value) && isNumeric(toCompare)) return Number(value) - Number(toCompare);
  return value < toCompare ? -1 : value > toCompare ? 1 : 0;
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
