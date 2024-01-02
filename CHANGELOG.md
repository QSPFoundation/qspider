# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.13.0](https://github.com/QSPFoundation/qspider/compare/v0.12.0...v0.13.0) (2022-10-04)

### Features

- add devtools to release ([549f481](https://github.com/QSPFoundation/qspider/commit/549f481ab2083c05c9292c14f33b4e02c6d22e5b))
- close modals on esc, focus msg button ([aff7d8c](https://github.com/QSPFoundation/qspider/commit/aff7d8c909c53a7f0a7e7516e1933da8758274ef))
- load config/game through get param ([491fb65](https://github.com/QSPFoundation/qspider/commit/491fb656963103165796c760748efe18d6563b7d))
- qsps support, qsp <-> qsps convertors ([360adf1](https://github.com/QSPFoundation/qspider/commit/360adf1052dfad07c582462f822910a4e28a7558))
- support positional argument to run game ([8290dc7](https://github.com/QSPFoundation/qspider/commit/8290dc76f3e0c7d55a8998596f8a111035d56f3f))

### Bug Fixes

- add menu separator support ([26b7734](https://github.com/QSPFoundation/qspider/commit/26b7734316cab1cfe836db820f69bb29c0e54151))
- fidable audio streaming for blob url (does not work in tauri) ([45723fa](https://github.com/QSPFoundation/qspider/commit/45723fa2ffc225604a3917e59bd6765257daaaf1))
- fix color conversion alpha channel ([1287b81](https://github.com/QSPFoundation/qspider/commit/1287b81c934c43f4eacc6d79bddfecf4fd51fed3))
- fix icon related error on gam open ([12aa970](https://github.com/QSPFoundation/qspider/commit/12aa970c9558e962442a7e1b5699c43644c5c8cf))
- fix init sequence (caused sync issues) ([967ddb5](https://github.com/QSPFoundation/qspider/commit/967ddb58f0ef568c1233d9bc865b60be5978653b))
- fix loading qsps files ([cdd73f4](https://github.com/QSPFoundation/qspider/commit/cdd73f4503b3c0e7fcad915342665e91bbac6e93))
- fix opening zip files on desktop ([bd4d2f8](https://github.com/QSPFoundation/qspider/commit/bd4d2f8125b3b1439b4b7c2904ceef07f1913399))
- fix resource loading from zip ([564f53c](https://github.com/QSPFoundation/qspider/commit/564f53c923ac01e612b0a10fc4187d4cef363239))
- fix selected state in aero menu ([d43ece4](https://github.com/QSPFoundation/qspider/commit/d43ece496824618bbdc87d1c7e37c0a37c616c54))
- imrove html processing, keep attributes ([d497e18](https://github.com/QSPFoundation/qspider/commit/d497e18f7371b647c2cd6d14d2f40e8dbd570cf8))
- long game title breaking toolbar layout ([d3521a7](https://github.com/QSPFoundation/qspider/commit/d3521a7b3dd0cb59c4aa29ab53a7b11f169598d6))
- replace react-delta with local code ([a10cd9d](https://github.com/QSPFoundation/qspider/commit/a10cd9d683233a810c211c6fb6b6f0c05ad06fa9))
- running from cli ([4b74577](https://github.com/QSPFoundation/qspider/commit/4b745772c69e23714aba79fdf6d65c6f0fb4821c))
- update failing check ([5638fc5](https://github.com/QSPFoundation/qspider/commit/5638fc56f9a28cf130addec2ad2d5fb2660dda3d))
- update list of void tags to prevent crashes ([f44a10a](https://github.com/QSPFoundation/qspider/commit/f44a10a2add6439d795d7a8f5e5adef530c67002))

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
