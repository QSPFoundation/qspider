import { getGreeting } from '../support/app.po';

describe('player', () => {
  beforeEach(() => {
    cy.setup_intercepts();
    cy.visit('/?config=test-assets/game.cfg');
  });

  it('should display welcome message', () => {
    // Function helper example, see `../support/app.po.ts` file
    getGreeting().contains('spider');
  });
});
