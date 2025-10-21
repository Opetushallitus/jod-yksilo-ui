/* eslint-disable no-console */
/**
 * Script to import translations from EXCEL files.
 * This script reads an EXCEL file and converts it into JSON translation files.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import xlsx from 'xlsx';

// Define the paths to the translation files
const __dirname = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname));
const translationsDir = path.join(__dirname, '../../src/i18n');
const inputDir = path.join(__dirname, '../../translations-import');
// get project name from command line arguments
const PROJECT_NAME = process.argv[2];

if (!PROJECT_NAME) {
  console.error('Please provide the project name as a command line argument.');
  process.exit(1);
}

function resolveExcelFile() {
  //check if inputDir exists
  if (!fs.existsSync(inputDir)) {
    console.error(`Input directory ${inputDir} does not exist.`);
    process.exit(1);
  }

  const files = fs.readdirSync(inputDir);
  const excelFiles = files.filter((file) => file.startsWith(PROJECT_NAME) && file.endsWith('.xlsx'));

  if (excelFiles.length === 0) {
    console.error(`No EXCEL file found in ${inputDir} starting with ${PROJECT_NAME}`);
    process.exit(1);
  } else if (excelFiles.length > 1) {
    console.error(
      `Multiple EXCEL files found in ${inputDir} starting with ${PROJECT_NAME}. Please ensure only one file is present.`,
    );
    process.exit(1);
  }

  return path.join(inputDir, excelFiles[0]);
}

// Function to read EXCEL translation files
function readExcelFile(filePath) {
  xlsx.set_fs(fs);
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return xlsx.utils.sheet_to_json(worksheet);
}

// Function to get translation object by language
function getTranslationObjectByLang(excelDataArray, lang) {
  const result = {};
  for (const row of excelDataArray) {
    if (row[lang]) {
      result[row.Key] = row[lang];
    }
  }

  // Sort the result by keys alphabetically
  // This compare function feels quite wrong but it sorts the same way as SortJSON vscode extension does it
  const compareKeys = ([a], [b]) => {
    if (a === b) return 0;
    return a > b ? 1 : -1;
  };
  const sortedKeys = Object.keys(result).sort(compareKeys);
  const sortedResult = {};
  for (const key of sortedKeys) {
    sortedResult[key] = result[key];
  }

  return sortedResult;
}

// Function to unflatten translations
function unflattenTranslations(flatTranslations) {
  const result = {};

  for (const [flatKey, value] of Object.entries(flatTranslations)) {
    const keys = flatKey.split('.');
    let current = result;

    for (const [index, key] of keys.entries()) {
      if (index === keys.length - 1) {
        current[key] = value;
      } else {
        if (!current[key]) {
          current[key] = {};
        }
        current = current[key];
      }
    }
  }

  return result;
}

function readTranslations(lang, file) {
  const translationPath = path.join(translationsDir, lang, file);
  if (fs.existsSync(translationPath)) {
    const rawData = fs.readFileSync(translationPath, 'utf-8');
    return JSON.parse(rawData);
  }
  return {};
}

// Function to write JSON translation files
function writeTranslations(lang, file, data) {
  const langDir = path.join(translationsDir, lang);
  if (!fs.existsSync(langDir)) {
    fs.mkdirSync(langDir, { recursive: true });
  }
  const translationPath = path.join(langDir, file);
  //note: add a newline at the end of the file same weay as Prettier does it
  fs.writeFileSync(translationPath, `${JSON.stringify(data, null, 2)}\n`, 'utf-8');
}

function removeImportedDraftKeys(draftTranslations, importedFlatKeys) {
  for (const flatKey of importedFlatKeys) {
    const keys = flatKey.split('.');
    let current = draftTranslations;
    for (const [index, key] of keys.entries()) {
      if (current && key in current) {
        if (index === keys.length - 1) {
          delete current[key];
        } else {
          current = current[key];
        }
      } else {
        break; // Key path does not exist, exit early
      }
    }
  }
}

const excelFilePath = resolveExcelFile();
/**
 * type ExcelDataArray = {
 *  Key: string;
 *   fi: string;
 *  sv: string;
 *  en: string;
 * }[];
 */
const excelDataArray = readExcelFile(excelFilePath);

const languages = ['fi', 'sv', 'en'];
const translationFile = 'translation.json';
const draftTranslationFile = 'draft.translation.json';

for (const lang of languages) {
  const flatTranslations = getTranslationObjectByLang(excelDataArray, lang);
  const unflattenedTranslations = unflattenTranslations(flatTranslations);
  writeTranslations(lang, translationFile, unflattenedTranslations);
  const draftTranslations = readTranslations(lang, draftTranslationFile);
  removeImportedDraftKeys(draftTranslations, Object.keys(flatTranslations));
  writeTranslations(lang, draftTranslationFile, draftTranslations);
}

console.log(`Translations imported successfully from ${excelFilePath}`);
