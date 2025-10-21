/* eslint-disable no-console */
/**
 * Script to export translations as EXCEL files.
 * This script reads the translation JSON files and converts them into an EXCEL format.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import xlsx from 'xlsx';

// Define the paths to the translation files
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const translationsDir = path.join(__dirname, '../../src/i18n');
const outputDir = path.join(__dirname, '../../translations-export');

// get project name from command line arguments
const PROJECT_NAME = process.argv[2];

if (!PROJECT_NAME) {
  console.error('Please provide the project name as a command line argument.');
  process.exit(1);
}

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Function to read JSON translation files
function readTranslations(lang, file) {
  const translationPath = path.join(translationsDir, lang, file);
  if (fs.existsSync(translationPath)) {
    const rawData = fs.readFileSync(translationPath, 'utf-8');
    return JSON.parse(rawData);
  }
  return {};
}

/*
 * Flattens nested translation objects into a single level object
 * for example: { a: { b: 'text' } } becomes { 'a.b': 'text' }
 */
function flattenTranslations(translations) {
  const result = {};

  function recurse(curr, prop) {
    // Check if the current property is a plain object (not array, not null)
    if (typeof curr === 'object' && curr !== null && !Array.isArray(curr)) {
      for (const key in curr) {
        recurse(curr[key], prop ? prop + '.' + key : key);
      }
    } else {
      result[prop] = curr;
    }
  }

  recurse(translations, '');
  return result;
}

// Function to convert translations to EXCEL
function exportToExcel(translationsData) {
  xlsx.set_fs(fs);
  const worksheetData = Object.entries(translationsData).map(([key, translations]) => ({
    Key: key,
    fi: translations.fi || '',
    sv: translations.sv || '',
    en: translations.en || '',
  }));
  const worksheet = xlsx.utils.json_to_sheet(worksheetData);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Translations');
  const dateStr = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  const outputPath = path.join(outputDir, `${PROJECT_NAME}-translations-${dateStr}.xlsx`);
  xlsx.writeFileSync(workbook, outputPath);
}

const languages = ['fi', 'sv', 'en'];
const translationFile = 'translation.json';
const draftTranslationFile = 'draft.translation.json';
const files = [translationFile, draftTranslationFile];

/*
 * Combine translations from multiple files and export them
 * into a single EXCEL file per language.
 * type TranslationData = {
 *  [key: string]: {[key: 'fi' | 'sv' | 'en']: string}
 * }
 */
const translationData = {};

for (const lang of languages) {
  for (const file of files) {
    if (lang !== 'fi' && file === draftTranslationFile) {
      // Skip draft translations for non-Finnish languages
      continue;
    }
    const translations = readTranslations(lang, file);
    const flattened = flattenTranslations(translations);
    for (const [key, value] of Object.entries(flattened)) {
      if (!translationData[key]) {
        translationData[key] = {};
      }
      translationData[key][lang] = value;
    }
  }
}

exportToExcel(translationData);

console.log(`Translations exported successfully to ${outputDir}`);
