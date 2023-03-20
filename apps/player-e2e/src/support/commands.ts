// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Chainable<Subject> {
    setup_intercepts(): void;
  }
}

Cypress.Commands.add('setup_intercepts', () => {
  cy.intercept('test-assets/game.cfg', { fixture: 'test-assets/game.cfg' });
  cy.intercept('test-assets/aero/game.qsps', { fixture: 'test-assets/aero/game.qsps' });
  cy.intercept('test-assets/classic/game.qsps', { fixture: 'test-assets/classic/game.qsps' });
  cy.intercept('test-assets/common/game.qsps', { fixture: 'test-assets/common/game.qsps' });
  cy.intercept('test-assets/qspider/game.qsps', { fixture: 'test-assets/qspider/game.qsps' });
});
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
