---
title: Additional game hotkeys
---

You can define additional hotkeys for your game in config file.

```toml
[game.hotkeys]
i = "Inventory"
"g o enter" = "Enter"
```

Attribute name in this case is hotkey definitions and its value is QSP location name that will be called whet hotkey combination is pressed. It is advised to use meningfull location names as they are displayed in pause menu on preferences screen.

Symbol keys can be defined just be thier names - `i`, `=` or `$`.

Special keys:

- `backspace`
- `tab`
- `enter`
- `capslock`
- `space`
- `pageup`
- `pagedown`
- `end`
- `home`
- `left`
- `up`
- `right`
- `down`
- `ins`
- `del`
- `plus`
- `f1` to `f19`

Modificator keys:

- `shift`
- `ctrl`
- `alt`
- `meta` - prefer this key over `ctrl` for better macOS support

You can define hotkey:

- single key press - `i`
- key chord (pressing several keys at the same time) with `+` as key separator - `alt+s`
- key sequence with space as key separator - `g o enter`
