import React, { useEffect } from 'react';
import { init } from '@qspider/qsp-wasm';

import './app.css';
import { Player } from './player/player';

async function initApi() {
  const api = await init();
  console.log(api.version());
}

export const App = () => {
  useEffect(() => {
    initApi();
  }, []);
  return <Player></Player>;
};
