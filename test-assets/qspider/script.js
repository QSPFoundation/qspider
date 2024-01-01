// записываем весь наш код в специальную переменную, чтобы потом можно было удалить
window.custom_game_script = {
  on_event(e) {
    console.log('event from game', e.detail.name, e.detail.args);
  },
  unload() {
    window.removeEventListener('game-unload', window.custom_game_script.unload);
    window.removeEventListener('qspider-event', window.custom_game_script.on_event);
    delete window.custom_game_script;
  },
};
window.addEventListener('game-unload', window.custom_game_script.unload);
window.addEventListener('qspider-event', window.custom_game_script.on_event);
