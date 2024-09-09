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
      return typeof value === 'string' ? value.includes(toCompare) : false;
    case 'not-contains':
      return typeof value === 'string' ? !value.includes(toCompare) : false;
    case 'greater':
      return typeof value === 'number' ? value > Number(toCompare) : value > toCompare;
    case 'less':
      return typeof value === 'number' ? value < Number(toCompare) : value < toCompare;
    case 'greater-or-equal':
      return typeof value === 'number' ? value >= Number(toCompare) : value >= toCompare;
    case 'less-or-equal':
      return typeof value === 'number' ? value <= Number(toCompare) : value <= toCompare;
  }
  return false;
}
