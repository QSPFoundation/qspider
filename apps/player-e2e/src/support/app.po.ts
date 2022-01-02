export const getGreeting = (): Cypress.Chainable<JQuery<HTMLHeadingElement>> => cy.get('h1');
