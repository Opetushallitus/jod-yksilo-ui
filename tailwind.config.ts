import type { Config } from 'tailwindcss';

import designSystem from '@jod/design-system/tailwind.config';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', './node_modules/@jod/design-system/lib/**/*.{js,ts,jsx,tsx}'],
  presets: [designSystem],
  plugins: [],
} satisfies Config;
