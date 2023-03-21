import { getGreeting } from '../support/app.po';

describe('player', () => {
  it('should display welcome message', () => {
    // Function helper example, see `../support/app.po.ts` file
    getGreeting().contains('spider');
  });
});
