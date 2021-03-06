<div align="center">
  <h1>qSpider</h1>
  <img src="./qspider-logo-512.png" width="256" /><br/>
  Web player for QSP
</div>

<hr />

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

# Qspider

## Development server

Run `npm start` for a dev server. Navigate to http://localhost:4200/. The app will automatically reload if you change any of the source files.

## Build

Run `nx build player` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Compile WASM

Get the Emscripten SDK, using these instructions: <https://emscripten.org/docs/getting_started/downloads.html>.

Run `npm run compile:wasm` to compile wasm module. Compiled js amd wasm files are committed to repository. So every time you change C code you need to recompile and commit updated files.

## Running unit tests

Run `nx test player` to execute the unit tests via [Jest](https://jestjs.io).

Run `nx affected:test` to execute the unit tests affected by a change.

## Running end-to-end tests

Run `ng e2e player` to execute the end-to-end tests via [Cypress](https://www.cypress.io).

Run `nx affected:e2e` to execute the end-to-end tests affected by a change.
