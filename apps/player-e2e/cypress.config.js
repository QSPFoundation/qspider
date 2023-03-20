const { defineConfig } = require('cypress');

module.exports = defineConfig({
  fileServerFolder: '.',
  fixturesFolder: './src/fixtures',
  modifyObstructiveCode: false,
  video: true,
  videosFolder: '../../dist/cypress/apps/player-e2e/videos',
  screenshotsFolder: '../../dist/cypress/apps/player-e2e/screenshots',
  chromeWebSecurity: false,
  e2e: {
    testIsolation: true,
    experimentalSessionAndOrigin: true,
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config);
      return config;
    },
    specPattern: './src/integration/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: './src/support/index.ts',
  },
});
