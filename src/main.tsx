import React from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { onCLS, onFCP, onFID, onLCP, onTTFB } from 'web-vitals';
import App from './App.tsx';
import './i18n/config';
import { persistor, store } from './state/store';

const container = document.getElementById('root')!;
const root = createRoot(container);

if (process.env.NODE_ENV !== 'production') {
  void import('@axe-core/react').then((axe) => {
    void axe.default(React, root, 1000);
  });

  onCLS(console.log);
  onFID(console.log);
  onFCP(console.log);
  onLCP(console.log);
  onTTFB(console.log);
}

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>,
);
