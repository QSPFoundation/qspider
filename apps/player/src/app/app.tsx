import React, { useEffect } from 'react';
import { init } from '@qspider/qsp-wasm';

import './app.css';

async function initApi() {
  const api = await init();
  console.log(api.version());
}

export const App = () => {
  useEffect(() => {
    initApi();
  }, []);
  return <div></div>;
};
