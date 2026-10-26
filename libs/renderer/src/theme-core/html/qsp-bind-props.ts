/** The `qsp-bind-index` attribute as a number; a missing or empty one is 0. */
export function parseBindIndex(qspBindIndex: string | undefined): number {
  return parseInt(qspBindIndex || '0', 10);
}

/** `checked` of a bound radio (its value equals the variable) or checkbox (the variable is not empty or 0). */
export function boundChecked(type: 'radio' | 'checkbox', bindValue: string, value: string | undefined): boolean {
  return type === 'radio' ? bindValue === value : Boolean(bindValue);
}
