import React from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { Metric } from 'web-vitals';
import { ErrorNoteProvider } from './components/ErrorNote';
import './i18n/config';
import './index.css';
import { routes } from './routes';

const router = createBrowserRouter(routes, {
  basename: '/yksilo',
});

const root = createRoot(document.getElementById('root')!);

if (process.env.NODE_ENV !== 'production') {
  void import('web-vitals').then((vitals) => {
    const warnOnlyNegativeMetrics = (metric: Metric) => {
      if (metric.rating !== 'good') {
        /* eslint-disable-next-line no-console */
        console.warn(`Metric ${metric.name} is not good`, metric);
      }
    };
    vitals.onCLS(warnOnlyNegativeMetrics);
    vitals.onINP(warnOnlyNegativeMetrics);
    vitals.onFCP(warnOnlyNegativeMetrics);
    vitals.onLCP(warnOnlyNegativeMetrics);
    vitals.onTTFB(warnOnlyNegativeMetrics);
  });
  void import('@axe-core/react').then((axe) => {
    void axe.default(React, root, 1000);
  });
}

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <ErrorNoteProvider>
        <RouterProvider router={router} />
      </ErrorNoteProvider>
    </HelmetProvider>
  </React.StrictMode>,
);
