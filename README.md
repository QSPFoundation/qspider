<div align="center">
  <h1>qSpider</h1>
  <img src="./public/qspider-logo.png" width="256" /><br/>
  Web and desktop player for QSP
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

## Running on desktop

To run desktop version of qSpider you need [Rust](https://rustup.rs/) installed on your machine.
Once you have it

```sh
cd ./src-tauri
cargo install
cd ..
```

To run desktop player in development mode run `npm run start:desktop`.
