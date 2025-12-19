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

Run the following command to update the JOD Design System to the latest version:

```shell
npm update @jod/design-system
```

If there is error from missing files run the following commands in assets-folder

```shell
aws-vault exec okm-jod-sharedservices-c-acc
aws s3 sync s3://jod-ui-assets .
```

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

This project manages translations using JSON files and an Excel-based workflow.  
The Excel files are generated from existing JSON translation files, sent for translation, and then imported back to update the source files.  
This process keeps all texts synchronized, tracks changes efficiently, and simplifies communication with translation services.

---

### File Structure

Each language has **two translation files**:

- **`translations.json`** - Contains approved translations provided by the translation service.
- **`draft.translations.json`** – Contains new or modified texts that have not yet been professionally translated.

All new or updated texts must be translated directly into the `draft.translations.json` files (manually or with AI assistance).  
No changes should ever be made directly to `translations.json`.

---

### Process

#### 1. During Development

- Add all new and modified texts to `draft.translations.json`.
- Always provide translations for the new or changed texts.
- Do not edit `translations.json` manually.

#### 2. When Requesting Translations (Export to Excel)

- Generate Excel files for translators using:

  ```bash
  npm run translations:export
  ```

- The script merges `translations.json` and `draft.translations.json`, ensuring all Finnish texts are included and modified texts override existing ones.

- The generated Excel file appears in:

```
translation-export/
```

- Send the Excel file(s) to the translation.

#### 3. When Receiving Translated Excel Files (Import Back)

- Place the returned Excel file(s) into:

```
translations-import/
```

- Import the translations with:

```bash
npm run translations:import
```

- The script updates all `translations.json` files based on the Excel content.

- It then removes only the imported translation keys from `draft.translations.json`, leaving other draft entries intact.
  This prevents the loss of new or modified texts that were added while the Excel file was being processed by the translation service.

---

### Summary

| Step           | Action                                                   | Command                       | Result                                                                                |
| -------------- | -------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------- |
| 1. Development | Add and translate new texts in `draft.translations.json` | –                             | Drafts updated                                                                        |
| 2. Export      | Generate Excel for translation                           | `npm run translations:export` | Excel in `translation-export/`                                                        |
| 3. Import      | Import completed translations                            | `npm run translations:import` | Updates translations.json and removes only imported keys from draft.translations.json |
