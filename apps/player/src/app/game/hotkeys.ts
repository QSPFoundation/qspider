import EventEmitter from 'eventemitter3';
import Mousetrap from 'mousetrap';

export class HotKeysManager extends EventEmitter {
  setupGlobalHotKeys(): void {
    Mousetrap.bind(['1', '2', '3', '4', '5', '6', '7', '8', '9'], (_, code) => {
      const index = parseInt(code, 10) - 1;
      this.emit('select_action', index);
    });
    Mousetrap.bind(['space'], () => {
      this.emit('select_single_action');
    });
    Mousetrap.bind(['mod+s'], () => {
      this.emit('save');
      return false;
    });
    Mousetrap.bind(['mod+o'], () => {
      this.emit('load');
      return false;
    });
    Mousetrap.bind(['mod+r'], () => {
      this.emit('restart');
      return false;
    });
    Mousetrap.bind(['f5'], () => {
      this.emit('quicksave');
      return false;
    });
    Mousetrap.bind(['f9'], () => {
      this.emit('quickload');
      return false;
    });
    Mousetrap.bind(['pageup'], () => {
      this.emit('volume_up');
      return false;
    });
    Mousetrap.bind(['pagedown'], () => {
      this.emit('volume_down');
      return false;
    });
    Mousetrap.bind(['home'], () => {
      this.emit('unmute');
      return false;
    });
    Mousetrap.bind(['end'], () => {
      this.emit('mute');
      return false;
    });
  }

  setupCustomHotKeys(map: Record<string, string>): void {
    for (const [key, value] of Object.entries(map)) {
      Mousetrap.bind(key, () => {
        this.emit('exec_loc', value);
        return false;
      });
    }
  }

  reset(): void {
    Mousetrap.reset();
    this.setupGlobalHotKeys();
  }
}
