/**
 * The condition of `<qsp-show when="...">`. With no condition attribute the variable must not be empty: `''` for a
 * string variable (`$` prefix), `0` for a numeric one. When several condition attributes are present the last of
 * them wins; `present` lists the attributes found, in the order of the known condition attributes.
 */
export function showCondition(variable: string, present: Array<[string, string]>): [string, string] {
  let condition: [string, string] = ['is-not', variable.startsWith('$') ? '' : '0'];
  for (const entry of present) {
    condition = entry;
  }
  return condition;
}
