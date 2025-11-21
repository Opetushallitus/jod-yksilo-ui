/**
 * Dynamic translation key exceptions
 *
 * Files and patterns that are allowed to use dynamic translation keys.
 * Each exception should have:
 * - file: relative path from src/ directory
 * - pattern: regex pattern that matches the allowed code line
 * - reason: explanation why this exception is needed
 */

export const DYNAMIC_KEY_EXCEPTIONS = [
  {
    file: 'hooks/useLocalizedRoutes/useLocalizedRoutes.tsx',
    pattern: /t\(translationKey,\s*\{\s*lng\s*\}\)/,
    reason: 'Route localization requires dynamic translation keys',
  },
  {
    file: 'routes/index.tsx',
    pattern: /i18n\.t\(competencesSlug,\s*\{\s*lng\s*\}\)/,
    reason: 'Route generation uses constant variable for translation key',
  },
];
