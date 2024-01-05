---
title: Adding Javascript to game
---

Additional Javascript files can be added to game using [config file](game.cfg).

```toml
[game.resources]
scripts = [
  "script.js"
]
```

As there is no way to unload JS code from memory (when switching to other game for example) - this need to be done manually.

Here is sample JS code that has all neededed for unload and acting on events from game code.
For now there is no way to call QSP code from Javascript.

```js
// storing our code into special valriable so that we can remove it later
window.custom_game_script = {
  // game event callback
  on_event(e) {
    // e.detail.name will contain event name (test_event or event_with_args from example)
    // e.detail.args will have array of additional arguments (for event_with_args it is [1, "test"])
  },
  // game unload callback
  unload() {
    // remowing event listeners
    window.removeEventListener('game-unload', window.custom_game_script.unload);
    window.removeEventListener('qspider-event', window.custom_game_script.on_event);
    // remowing variable
    delete window.custom_game_script;
  },
};
// adding listener for game unload event
window.addEventListener('game-unload', window.custom_game_script.unload);
// adding listener for game events
window.addEventListener('qspider-event', window.custom_game_script.on_event);
```

Game events can be triggeres from QSP code using `exec`.

```python
exec('qspider.event: test_event');
exec('qspider.event: event_with_args[1, "test"]');
```
