import { describe, expect, it } from 'vitest';
import { showCondition } from './show-condition';

describe('showCondition', () => {
  it('shows a numeric variable unless it is 0 when no condition is written', () => {
    expect(showCondition('hp', [])).toEqual(['is-not', '0']);
  });

  it('shows a string variable unless it is empty when no condition is written', () => {
    expect(showCondition('$name', [])).toEqual(['is-not', '']);
  });

  it('uses the written condition', () => {
    expect(showCondition('hp', [['greater', '10']])).toEqual(['greater', '10']);
  });

  it('uses the written condition for a string variable too', () => {
    expect(showCondition('$class', [['equals', 'mage']])).toEqual(['equals', 'mage']);
  });

  it('lets the last of several conditions win', () => {
    expect(
      showCondition('hp', [
        ['equals', '5'],
        ['less', '20'],
      ]),
    ).toEqual(['less', '20']);
  });
});
