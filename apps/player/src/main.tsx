import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './app/app';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register(import.meta.env.MODE === 'production' ? '/service-worker.js' : '/dev-sw.js?dev-sw', {
    type: import.meta.env.MODE === 'production' ? 'classic' : 'module',
  });
}
