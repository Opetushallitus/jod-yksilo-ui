import React from 'react';
import { createRoot } from 'react-dom/client';
import { onCLS, onFCP, onFID, onLCP, onTTFB } from 'web-vitals';
import { Provider } from 'react-redux';
import './i18n/config';
import App from './App.tsx';
import { store } from './state/store';

const container = document.getElementById('root')!;
const root = createRoot(container);

if (process.env.NODE_ENV !== 'production') {
  /* eslint-disable @typescript-eslint/no-floating-promises */
  import('@axe-core/react').then((axe) => {
    axe.default(React, root, 1000);
  });
  /* eslint-enable @typescript-eslint/no-floating-promises */

  onCLS(console.log);
  onFID(console.log);
  onFCP(console.log);
  onLCP(console.log);
  onTTFB(console.log);
}

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);
