---
title: Config file
---

qSpider uses config file `game.cfg` to get additional info on game.
It is based on [TOML](https://toml.io/en/) config format that is easy to read due to obvious semantics.

## Config structure

Config file support defining multiple games in one file.
Every game definition should start with `[[game]]` line (please note double brackets).

## Game data section

Use following attributes to provide information about game.

- `id` - unique game identifier mainly used to relate saves to game
- `mode` - what mode should player run in, currently supported values are `classic`, `aero` and `qspider`, if mode is not defined in config file it defaults to `classic`
- `title` - game title
- `description` - game description
- `author` - game author
- `ported_by` - who ported game to QSP
- `version` - game version

Most of this info is shown on game shelf and in pause screen.

## Game file definition

Use `file` attribute to define main game file - path should be relative to config file.

## Game settings

- `save_slots` defines number of save slots avaliable in pause screen (9 slots are used if not defined)
- `themes` - list of custom theme files
- `defaultTheme` - starting theme of game (if not probided will depend on `mode`)

## Hotkeys section

Section starting with `[game.hotkeys]` line can be used to define [custom hotkeys](game.hotkeys) in game.

## Game resourses section

Section starting with `[game.resources]` can be used to describe additional resouces to be loaded together with game.

- `styles` - list of css files (can be both external urls and files next to config)
- `scripts` - list of [javascript files](game.javascript)
- `fonts` - list of [additional fonts](game.fonts)
- `icon` - path to game icon (used as favicon in brwoser or as application icon on desktop)

## Destop settings sections

Additional settings for application window can be defined in sections starting with `[game.window]` line.

- `width`, `minWidth` and `maxWidth` describe window starting width and max/min values when resizing
- `height`, `minHeight` and `maxHeight` describe window starting height and max/min values when resizing
- settings `resizable` to `false` will disable window resizing
- setting `fullscreen` to `true` will start game in fullscreen mode

## Aero settings

If game is using `aero` mode additional section starting with `[game.aero]` line can be used to set `width` and `height` of aero player. On desktop `aero` mode automatically sets application window size to `width`/`height` defined in this section and disables window resizing.

## Example config file with all fields defined

```toml
[[game]]
id = "sample-game"
mode = "aero"
title = "Config example"
description = """Multiline strings are also supported using tripple quotes.
One more line of description.
"""
author = "werewolf"
ported_by = "werewolf"
version = "1.0.0"
file = "game.qsp"
save_slots=12
themes = [
  "custom-theme.html"
]
defaultTheme = "custom-theme"

[game.hotkeys]
i = "hk-inventory"
"g o enter" = "hk-complex"

[game.resources]
styles = [
  "https://fonts.googleapis.com/css?family=Sigmar",
  "styles.css"
]
scripts = [
  "script.js"
]
fonts = [
  ["flowers", "flowers-sunday.woff2"]
]
icon = "icon.png"

[game.window]
width = 1200
minWidth = 800
maxWidth = 1400
height = 768
minHeight = 600
maxHeight = 900
resizable = true
fullscreen = true

[game.aero]
width = 1200
height = 768
```
