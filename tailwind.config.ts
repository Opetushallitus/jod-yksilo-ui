import type { Config } from 'tailwindcss';

import designSystem from '@jod/design-system/tailwind.config';

export default {
  prefix: '',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  presets: [designSystem],
  plugins: [],
  theme: {
    extend: {
      colors: {
        todo: '#ff0000',
      },
    },
  },
} satisfies Config;
