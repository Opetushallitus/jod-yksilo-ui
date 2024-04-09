/** @type {import('tailwindcss').Config} */

import designSystem from '@jod/design-system/tailwind.config.js';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  presets: [designSystem],
  plugins: [],
};
