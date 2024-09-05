import React from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import './i18n/config';

const container = document.getElementById('root')!;
const root = createRoot(container);

if (process.env.NODE_ENV !== 'production') {
  void import('web-vitals').then((vitals) => {
    /* eslint-disable no-console */
    vitals.onCLS(console.log);
    vitals.onFID(console.log);
    vitals.onFCP(console.log);
    vitals.onLCP(console.log);
    vitals.onTTFB(console.log);
    /* eslint-enable no-console */
  });
  void import('@axe-core/react').then((axe) => {
    void axe.default(React, root, 1000);
  });
}

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>,
);
