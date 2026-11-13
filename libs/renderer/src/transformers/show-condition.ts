/**
 * The condition of `<qsp-show when="...">`. With no condition attribute the variable must not be empty: `''` for a
 * string variable (`$` prefix); neither `''`, `0` nor unset for any other, since an unprefixed variable may hold
 * either type. When several condition attributes are present the last of them wins; `present` lists the attributes
 * found, in the order of the known condition attributes.
 */
export function showCondition(variable: string, present: Array<[string, string]>): [string, string] {
  let condition: [string, string] = variable.startsWith('$') ? ['is-not', ''] : ['not-empty', ''];
  for (const entry of present) {
    condition = entry;
  }
  return condition;
}
