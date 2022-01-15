# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.12.0](https://github.com/QSPFoundation/qspider/compare/v0.11.1...v0.12.0) (2022-01-15)

### Features

- add window config ([720356f](https://github.com/QSPFoundation/qspider/commit/720356f75e2bcc7e73469923fdc2b7c6abb7c250))
- load game from disk, support drop to open ([a1c4983](https://github.com/QSPFoundation/qspider/commit/a1c498366716475b0309902b2db4030835573293))
- load main config from url ([31b715e](https://github.com/QSPFoundation/qspider/commit/31b715e7efbd332e9f0b2d0714f3dbcd260ae476))
- support game level config file ([884b177](https://github.com/QSPFoundation/qspider/commit/884b17773daf9dbc6a15202d6113bf871ff30fb1))
- support opening game from cli ([1528955](https://github.com/QSPFoundation/qspider/commit/152895593ec2ca76dd4aef231fb2304457516266))

### Bug Fixes

- $fname not working, layout cleanup ([1451274](https://github.com/QSPFoundation/qspider/commit/14512743daf1d20e26a3fa48077cc9c6522955b4))
- change vertical align of img inside table ([4f9ffa8](https://github.com/QSPFoundation/qspider/commit/4f9ffa8f87a5e0ff565f162c80c7eb0ed032f868))
- fix resize on opening aqsp file ([0a48b06](https://github.com/QSPFoundation/qspider/commit/0a48b06a382c2e51f68a62b4be1ac57c04f640d8))
- fix save/restore ([b155319](https://github.com/QSPFoundation/qspider/commit/b1553197fb481a7a37cc74da2121c00f6a863154))
- fix working with cyrylic symbols in path ([2796a6b](https://github.com/QSPFoundation/qspider/commit/2796a6b1b786c53d14a0ab86c9951aa6ab6ce119))
- html in input ([3eab14f](https://github.com/QSPFoundation/qspider/commit/3eab14f7f9b2ac1fea7873c0dbc817c18631ab67))
- loading game from archive ([356d58a](https://github.com/QSPFoundation/qspider/commit/356d58aa623dc5c2fa95c37b095ec6453cd653bc))
- make center tag and align attribute to behave more like classic ([21198bf](https://github.com/QSPFoundation/qspider/commit/21198bf1f53c8c563fd2e6d53367cb368f641994))
- opening games not from config ([b41173e](https://github.com/QSPFoundation/qspider/commit/b41173ea3b6bab764917e661ca7da9cbe5d19eb0))
- remove scroll padding when arrows are hidden ([613503d](https://github.com/QSPFoundation/qspider/commit/613503dc5c8f30d813f749535adc4f87f048e86a))

### [0.11.1](https://github.com/QSPFoundation/qspider/compare/v0.11.0...v0.11.1) (2021-10-31)

### Bug Fixes

- add missing data-qsp attributes ([02d7abd](https://github.com/QSPFoundation/qspider/commit/02d7abd7c422e48ec240c94a8e3af9e6cca4a2c5))
- fix base path when loading module ([a1b36e7](https://github.com/QSPFoundation/qspider/commit/a1b36e701762621490a37e6b4cf05dec0691406b))
- fix panels min height ([56248fc](https://github.com/QSPFoundation/qspider/commit/56248fcc09ded6a13739e5caaec9569ffc241dfe))
- fix svg support ([02836ea](https://github.com/QSPFoundation/qspider/commit/02836eadfa01b80480c00e29181ed9abf7b37d4f))

## [0.11.0](https://github.com/QSPFoundation/qspider/compare/v0.10.0...v0.11.0) (2021-10-21)

### Features

- support AeroQSP format
- support style attribute
- add data-qsp attributes to UI elements ([61fe876](https://github.com/QSPFoundation/qspider/commit/61fe876f6d5db4912cb5ad6a0a7d8d19753326f8))

### Bug Fixes

- fix onactsel call ([e12667d](https://github.com/QSPFoundation/qspider/commit/e12667dc6f67943d72782339b0b2ebf02249c180))
- hide save/load buttons on nosave=1 ([cde66c0](https://github.com/QSPFoundation/qspider/commit/cde66c0ee8e2597661e81079f6babad277c759e6)), closes [#85](https://github.com/QSPFoundation/qspider/issues/85)
- fix align attribute in tables

## [0.10.0](https://github.com/QSPFoundation/qspider/compare/v0.9.1...v0.10.0) (2021-05-23)

### Features

- additional game resources( css, js, fonts, favicon) ([f5f9c4d](https://github.com/QSPFoundation/qspider/commit/f5f9c4d1e8a01e0f0e30bd596c328bda7e7b0ec6))
- video tag support ([a88d51f](https://github.com/QSPFoundation/qspider/commit/a88d51f322c2936a87e4eed9d337d09fa91bd3a2))

### Bug Fixes

- add hover effect ro game list and save dialogs ([4bd3477](https://github.com/QSPFoundation/qspider/commit/4bd3477f72f1863783fcef4d2d353b7d74211457))
- don't start sound anew if already playing ([8d3a977](https://github.com/QSPFoundation/qspider/commit/8d3a977fa21a9eb9f0a9ce2e072d6b18339fc9b8))
- fix working with save greater than 64kb ([dfe5427](https://github.com/QSPFoundation/qspider/commit/dfe54271454646e7c729404fb89dd01e71680ef1))
- qsp error handling ([ba1b456](https://github.com/QSPFoundation/qspider/commit/ba1b45627caf8a6c8a418119b0253c02f97ab385))

### [0.9.1](https://github.com/QSPFoundation/qspider/compare/v0.9.0...v0.9.1) (2020-11-01)

### Features

- load from zip ([915d5a8](https://github.com/QSPFoundation/qspider/commit/915d5a8c404b0505ce74386c1fe07b549ce175fa))

### Bug Fixes

- fix playing audio from archive ([82f2184](https://github.com/QSPFoundation/qspider/commit/82f2184afc244bb035c95ff035c13a144109f736))

## [0.9.0](https://github.com/QSPFoundation/qspider/compare/v0.8.1...v0.9.0) (2020-10-18)

### ⚠ BREAKING CHANGES

- change config file format

### Features

- add game list support ([8d2fffb](https://github.com/QSPFoundation/qspider/commit/8d2fffb63546c2bfa50d56a9c61b1286f4bb509c))

### Bug Fixes

- fix html preprocessing ([c3d2c22](https://github.com/QSPFoundation/qspider/commit/c3d2c22ff0ba2cb669b72cc26075094c583ee3bf))

### [0.8.1](https://github.com/QSPFoundation/qspider/compare/v0.8.0...v0.8.1) (2020-10-10)

### Features

- add execLoc to qsp bindings ([996d66d](https://github.com/QSPFoundation/qspider/commit/996d66d562a96c0332346d4a2ee7830553b6edc1))
- add support for shortcuts ([bbb8f76](https://github.com/QSPFoundation/qspider/commit/bbb8f764f2be5c76c66f1508d4845d1f68e3bd46))

### Bug Fixes

- fix resource path when using openqst ([b662183](https://github.com/QSPFoundation/qspider/commit/b662183aaa37b926fcf7d24f97fe4f46b5c14201))

## 0.8.0 (2020-10-07)

Initial release.
