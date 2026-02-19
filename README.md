# JOD Yksilö UI

This repository is the UI for JOD Yksilö. JOD Yksilö is part of the Digital Service Ecosystem for Continuous Learning (JOD) project.

The UI app is built using React, Vite, and TypeScript. React is a popular JavaScript library for building user interfaces, while Vite is a build tool that provides fast and efficient development experience. TypeScript is a superset of JavaScript that adds static type checking and other features to the language.

Together, these technologies provide a robust and efficient development environment for building modern web applications with a focus on user experience. The app is designed to be responsive and accessible.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

1. First, ensure that you have [NVM](https://github.com/nvm-sh/nvm) installed on your machine.
2. Clone this repository to your local machine.
3. Open a terminal window and navigate to the root directory of the project.
4. Run the following command to install Node.js & NPM and the dependencies:

```shell
nvm install
nvm use
npm install
npm exec allow-scripts run
```

5. Take the steps in JOD Design System repository to get components of the design system work in hot reload mode.
6. Once the installation is complete, run the following command to start the development server:

```shell
npm run dev
```

7. The app should now be running on http://localhost:8080/.

## Running backend locally

See instructions in [JOD Yksilö backend repository](https://github.com/Opetushallitus/jod-yksilo) and [Wiki page](https://wiki.eduuni.fi/pages/viewpage.action?pageId=488735698).

## Download third-party UI assets

Third-party assets such as images, fonts, and icons are stored in a S3 bucket. Guide to download assets is available in the infrastructure repository.

## Updating JOD Design System

To update the JOD Design System to the latest version:

1. Check the latest release in the [JOD Design System GitHub repository](https://github.com/Opetushallitus/jod-design-system/releases)
2. Update the `@jod/design-system` dependency URL in `package.json` to point to the latest release `.tgz` file
3. Run `npm install` to install the updated version

## Generating TypeScript types from OpenAPI schema

Start the JOD Yksilö backend locally and make sure it is running on http://localhost:9080/. Then run the following command to generate TypeScript types from the OpenAPI schema:

```shell
npx openapi-typescript http://localhost:9080/yksilo/openapi/openapi.json/Yksilo -o src/api/schema.d.ts && npx prettier src/api/schema.d.ts --write
```

Note that the backend needs to have all features enabled or the generated types may be incomplete.

## Accessibility testing

### Axe

Axe is used automatically when run in development mode.
When starting the development server you can see findings of Axe, if any, on the console for e.g when missing `<main>-tag`:

```
New axe issues
moderate: Document should have one main landmark https://dequeuniversity.com/rules/axe/4.8/landmark-one-main?application=axeAPI
moderate: All page content should be contained by landmarks https://dequeuniversity.com/rules/axe/4.8/region?application=axeAPI
```

### Axe DevTools

Useful browser extension to use

- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/axe-devtools/)
- [Chromium](https://chromewebstore.google.com/detail/axe-devtools-web-accessib/lhdoppojpmngadmnindnejefpokejbdd)
- [Edge](https://microsoftedge.microsoft.com/addons/detail/axe-devtools-web-access/kcenlimkmjjkdfcaleembgmldmnnlfkn)

### WAVE Browser Extensions

- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/wave-accessibility-tool/)
- [Chromium](https://chrome.google.com/webstore/detail/wave-evaluation-tool/jbbplnpkjmmeebjpijfedlgcdilocofh)
- [Edge](https://microsoftedge.microsoft.com/addons/detail/wave-evaluation-tool/khapceneeednkiopkkbgkibbdoajpkoj)

### Google Lighthouse

- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/google-lighthouse/)
- [Chromium](https://chromewebstore.google.com/detail/lighthouse/blipmdconlkpinefehnmjammfjpmpbjk)

## Translation Management

### Overview

This project uses [Tolgee](https://tolgee.io) for translation management. Translation keys are stored in JSON files and automatically synchronized with the Tolgee platform via GitHub Actions. Tolgee provides a web interface for managing translations, collaborating with translators, and tracking translation status.

---

### File Structure

Translation files are organized by namespace and language:

```
src/i18n/
  yksilo/          # Default namespace for JOD Yksilo page specific translations
    fi.json
    en.json
    sv.json
  common/           # Shared translations across JOD projects
    fi.json
    en.json
    sv.json
```

- **`yksilo`** - Contains JOD Yksilo page specific translations (default namespace)
- **`common`** - Contains shared translations used across multiple JOD projects. Reference these in code with `common:` prefix (e.g., `t('common:myKey')`)

---

### Developer Workflow

#### 1. Before Starting Work on a New Feature

Fetch the latest translations from Tolgee CDN to ensure you have up-to-date translations:

```bash
npm run translations:fetch
```

**Always run this when developing features that involve translation changes.**

#### 2. During Development

- Add translation keys to your code using i18next hooks (e.g., `useTranslation()`)
- Add the Finnish source text and all translations (fi, en, sv) to the appropriate JSON file in `src/i18n/`
- Use AI assistance or other tools to help with translations
- For `common` namespace keys, reference them in code with `common:` prefix: `t('common:myKey')`
- Run `npm run translations:check` to verify that all keys are properly defined

**Important:** Never delete translation keys from JSON files manually. Deprecated keys are automatically managed by GitHub Actions.

#### 3. After Merging to Main

GitHub Actions automatically handles:

1. **Push translations to Tolgee** - New translation keys are uploaded to Tolgee platform. Existing keys are not modified or deleted.
2. **Tag management** - The `manage-tags` script runs automatically:
   - Unused keys are marked as deprecated in Tolgee
   - JIRA ticket tags are automatically added (if ticket ID can be parsed from branch or commit) to track when changes reach production
   - Keys can be safely removed from Tolgee once verified in production

**Note:** Updates to existing translations and key deletions must be done directly in the Tolgee platform.

### Available Commands

| Command                      | Purpose                                                                          |
| ---------------------------- | -------------------------------------------------------------------------------- |
| `npm run translations:check` | Analyze translation keys and detect missing or unused keys                       |
| `npm run translations:fetch` | Download latest translations from Tolgee CDN (run before feature work)           |
| `npm run translations:push`  | Manually upload new keys to Tolgee (requires TOLGEE_API_KEY, GitHub Actions)     |
| `npm run translations:tag`   | Manually tag translation keys by usage (requires TOLGEE_API_KEY, GitHub Actions) |

---

### Configuration

Tolgee configuration is stored in [.tolgeerc.json](.tolgeerc.json). This file defines:

- Project ID and credentials
- Namespaces and languages
- File paths and patterns
- Push/pull settings
