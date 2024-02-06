import React from 'react';
import { createRoot } from 'react-dom/client';
import './i18n/config';
import App from './App.tsx';

const container = document.getElementById('root')!;
const root = createRoot(container);

if (process.env.NODE_ENV !== 'production') {
  /* eslint-disable @typescript-eslint/no-floating-promises */
  import('@axe-core/react').then((axe) => {
    axe.default(React, root, 1000);
  });
  /* eslint-enable @typescript-eslint/no-floating-promises */
}

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
