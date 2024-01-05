---
title: Adding fonts to your game
---

There are 2 ways to add fonts to your game:

- using online hosted services (like Google fonts) - this way your game will require internet connection for font to be loaded
- package font with game

## Adding Google font

- Go to [https://fonts.google.com/](https://fonts.google.com/) and find a font to your liking
- Add link to font css adding font name to it (replace spaces in font name with `+`)

```toml
[game.resources]
styles = [
  "https://fonts.googleapis.com/css2?family=Crimson+Pro",
]
```

After that you can use it in your css files.

```css
body {
  font-family: 'Crimson Pro', serif;
  font-size: 48px;
}
```

Or change it globaly with `$FNAME` variable.

```python
$FNAME = 'Crimson Pro'
```

## Packaging font with game

- find and download font to your liking
- if it is not in `wott2` format - use online converter
- place font files next to your config file (for example in `fonts` folder)
- define list of fonts in config file

```toml
[game.resources]
fonts = [
  ["Shelter", "fonts/shelter.woff2"],
]
```

Here first string in nested list is font name and second is path to font file.

If a font has Bold, Italic и BoldItalic variants in separate files - every variant should be defined separately with additional marks that define variant specifics.

```toml
fonts = [
  ["Shelter", "fonts/shelter.woff2"],
  ["Shelter", "fonts/shelter-bold.woff2", "bold"],
  ["Shelter", "fonts/shelter-italic.woff2", "normal", "italic"],
  ["Shelter", "fonts/shelter-bold-italic.woff2", "bold", "italic"]
]
```
