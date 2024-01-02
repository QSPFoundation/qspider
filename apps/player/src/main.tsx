import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { Workbox } from 'workbox-window';

import { App } from './app/app';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if ('serviceWorker' in navigator) {
  const wb = new Workbox(
    import.meta.env.MODE === 'production'
      ? new URL('./service-worker.js', window.location.href).toString()
      : '/dev-sw.js?dev-sw',
    {
      type: import.meta.env.MODE === 'production' ? 'classic' : 'module',
    },
  );

  wb.register();
}
