import '@cypress/code-coverage/support';

import './commands';

before(() => {
  cy.visit('/?config=test-assets/game.cfg');
});

beforeEach(() => {
  cy.intercept('test-assets/game.cfg', { fixture: 'test-assets/game.cfg' });
  cy.intercept('test-assets/aero/game.qsps', { fixture: 'test-assets/aero/game.qsps' });
  cy.intercept('test-assets/classic/game.qsps', { fixture: 'test-assets/classic/game.qsps' });
  cy.intercept('test-assets/common/game.qsps', { fixture: 'test-assets/common/game.qsps' });
  cy.intercept('test-assets/qspider/game.qsps', { fixture: 'test-assets/qspider/game.qsps' });
});
