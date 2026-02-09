import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { Metric } from 'web-vitals';
import './i18n/config';
import './index.css';
import { getRoutes } from './routes';
import { loadFeatures } from './utils/features';
import { loadNotifications } from './utils/notifications';

try {
  await Promise.all([loadFeatures(), loadNotifications()]);
} catch (_) {
  // It's safe to ignore this error.
  // If feature loading fails, the app will continue to work with default disabled features and no notifications.
}

export const router = createBrowserRouter(getRoutes(), {
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
    <RouterProvider router={router} />
  </React.StrictMode>,
);
