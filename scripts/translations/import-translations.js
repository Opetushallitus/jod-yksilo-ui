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

// Function to remove trailing characters if they weren't in original
function removeUnwantedTrailing(text, originalText) {
  // Remove trailing tabs if original didn't have them
  const originalEndsWithTab = originalText && typeof originalText === 'string' && originalText.endsWith('\t');
  if (!originalEndsWithTab && text.endsWith('\t')) {
    // Find the last non-tab character
    let i = text.length - 1;
    while (i >= 0 && text[i] === '\t') {
      i--;
    }
    return text.substring(0, i + 1);
  }
  return text;
}

// Function to handle text without newlines
function handleTextWithoutNewlines(text, originalText) {
  const originalEndsWithNewline = originalText && typeof originalText === 'string' && originalText.endsWith('\n');
  return originalEndsWithNewline ? text + '\n' : text;
}

// Function to handle text with only trailing newlines
function handleTrailingNewlines(text, originalText) {
  const originalEndsWithNewline = originalText && typeof originalText === 'string' && originalText.endsWith('\n');
  const trimmedText = text.trimEnd();
  return originalEndsWithNewline ? trimmedText + '\n' : trimmedText;
}

// Function to handle text with br tags
function handleBrTags(text, originalText) {
  const originalEndsWithNewline = originalText && typeof originalText === 'string' && originalText.endsWith('\n');
  const trimmedText = text.trimEnd();
  let result = trimmedText.replaceAll('\n', '<br/>');
  if (originalEndsWithNewline) {
    result += '\n';
  }
  return result;
}

// Function to handle text with newlines in the middle
function handleMiddleNewlines(text, originalText) {
  const originalEndsWithNewline = originalText && typeof originalText === 'string' && originalText.endsWith('\n');
  const trimmedText = text.trimEnd();

  if (originalEndsWithNewline && !text.endsWith('\n')) {
    return trimmedText + '\n';
  }
  return text;
}

// Function to clean translation text
function cleanTranslationText(text, originalText) {
  if (typeof text !== 'string') {
    return text;
  }

  // Remove unwanted trailing characters
  text = removeUnwantedTrailing(text, originalText);

  // Check if text has newlines
  const hasNewlines = text.includes('\n');

  if (!hasNewlines) {
    return handleTextWithoutNewlines(text, originalText);
  }

  // Count newlines (excluding trailing ones)
  const trimmedText = text.trimEnd();
  const newlineCount = (trimmedText.match(/\n/g) || []).length;

  // If there are no newlines in the middle (only at the end)
  if (newlineCount === 0) {
    return handleTrailingNewlines(text, originalText);
  }

  // Check if original text uses <br/> tags
  if (originalText && typeof originalText === 'string' && originalText.includes('<br/>')) {
    return handleBrTags(text, originalText);
  }

  // If there are newlines in the middle, preserve them
  return handleMiddleNewlines(text, originalText);
}

// Function to get translation object by language
function getTranslationObjectByLang(excelDataArray, lang, existingTranslations, draftTranslations) {
  const result = {};
  const flatExisting = flattenTranslations(existingTranslations);
  const flatDraft = flattenTranslations(draftTranslations);

  for (const row of excelDataArray) {
    if (row[lang]) {
      const key = row.Key;
      const originalText = flatExisting[key] || flatDraft[key];
      result[key] = cleanTranslationText(row[lang], originalText);
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

// Function to sort object keys alphabetically (recursively)
function sortObjectKeys(obj) {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return obj;
  }

  const sorted = {};
  const compareKeys = (a, b) => {
    if (a === b) return 0;
    return a > b ? 1 : -1;
  };

  const keys = Object.keys(obj).sort(compareKeys);
  for (const key of keys) {
    sorted[key] = sortObjectKeys(obj[key]);
  }

  return sorted;
}

// Function to write JSON translation files
function writeTranslations(lang, file, data) {
  const langDir = path.join(translationsDir, lang);
  if (!fs.existsSync(langDir)) {
    fs.mkdirSync(langDir, { recursive: true });
  }
  const translationPath = path.join(langDir, file);
  const sortedData = sortObjectKeys(data);
  //note: add a newline at the end of the file same weay as Prettier does it
  fs.writeFileSync(translationPath, `${JSON.stringify(sortedData, null, 2)}\n`, 'utf-8');
}

function keyPathExists(obj, keys) {
  let current = obj;
  for (const [index, key] of keys.entries()) {
    if (index === keys.length - 1) {
      return key in current;
    }
    if (current && typeof current[key] === 'object') {
      current = current[key];
    } else {
      return false;
    }
  }
  return true;
}

function flattenTranslations(obj, prefix = '') {
  const result = {};
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue;
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      Object.assign(result, flattenTranslations(obj[key], newKey));
    } else {
      result[newKey] = obj[key];
    }
  }
  return result;
}

function setValueAtPath(obj, keys, value) {
  let current = obj;
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

function removeKeyAtPath(obj, keys) {
  let current = obj;
  for (const [index, key] of keys.entries()) {
    if (index === keys.length - 1) {
      delete current[key];
    } else {
      current = current[key];
    }
  }
}

function updateExistingTranslations(existingTranslations, importedFlatTranslations) {
  // Update only keys that already exist in existingTranslations
  for (const [flatKey, value] of Object.entries(importedFlatTranslations)) {
    const keys = flatKey.split('.');

    if (keyPathExists(existingTranslations, keys)) {
      setValueAtPath(existingTranslations, keys, value);
    }
  }
}

function addKeysFromDraft(existingTranslations, importedFlatTranslations, draftTranslations) {
  // Add keys from importedFlatTranslations that exist in draft
  // (moving them from draft to translation.json)
  const flatDraft = flattenTranslations(draftTranslations);

  for (const [flatKey, value] of Object.entries(importedFlatTranslations)) {
    const keys = flatKey.split('.');

    // If key is in draft (regardless if it's in existingTranslations), add/update it
    if (flatKey in flatDraft) {
      setValueAtPath(existingTranslations, keys, value);
    }
  }
}

function filterExistingKeys(importedFlatTranslations, existingTranslations, draftTranslations) {
  // Flatten both existing translation files
  const flatExisting = flattenTranslations(existingTranslations);
  const flatDraft = flattenTranslations(draftTranslations);

  // Only keep keys from Excel that exist in either translation.json or draft.translation.json
  const filtered = {};
  for (const [key, value] of Object.entries(importedFlatTranslations)) {
    if (key in flatExisting || key in flatDraft) {
      filtered[key] = value;
    }
  }

  return filtered;
}

function removeImportedKeysFromDraft(draftTranslations, importedFlatKeys, existingTranslations) {
  // Remove keys from draft.translation.json ONLY if they are in Excel
  // AND will be added to translation.json
  const flatExisting = flattenTranslations(existingTranslations);

  for (const flatKey of importedFlatKeys) {
    const keys = flatKey.split('.');

    // Only remove from draft if:
    // 1. Key exists in draft
    // 2. Key will be in translation.json (either already there or being added)
    if (keyPathExists(draftTranslations, keys) && flatKey in flatExisting) {
      removeKeyAtPath(draftTranslations, keys);
    }
  }
}

function moveDuplicateKeysBackToDraft(existingTranslations, draftTranslations, importedFlatKeys) {
  // Find keys that exist in both translations.json and draft.translation.json
  // but are NOT in Excel - move them from translations.json to draft.translation.json
  const flatExisting = flattenTranslations(existingTranslations);
  const flatDraft = flattenTranslations(draftTranslations);
  const importedKeysSet = new Set(importedFlatKeys);

  for (const [flatKey, value] of Object.entries(flatExisting)) {
    // If key exists in both files and is NOT in Excel
    if (flatKey in flatDraft && !importedKeysSet.has(flatKey)) {
      const keys = flatKey.split('.');

      // Add to draft if not already there (might have been removed)
      if (!keyPathExists(draftTranslations, keys)) {
        setValueAtPath(draftTranslations, keys, value);
      }

      // Remove from existing translations
      removeKeyAtPath(existingTranslations, keys);
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
  // Read existing translations first (needed for cleanTranslationText)
  const existingTranslations = readTranslations(lang, translationFile);
  const draftTranslations = readTranslations(lang, draftTranslationFile);

  const importedFlatTranslations = getTranslationObjectByLang(
    excelDataArray,
    lang,
    existingTranslations,
    draftTranslations,
  );

  // Only keep keys from Excel that already exist in either file
  const filteredFlatTranslations = filterExistingKeys(
    importedFlatTranslations,
    existingTranslations,
    draftTranslations,
  );

  // Move duplicate keys back to draft if they are not in Excel
  moveDuplicateKeysBackToDraft(existingTranslations, draftTranslations, Object.keys(filteredFlatTranslations));

  // Update translation.json with filtered keys (preserve existing structure)
  updateExistingTranslations(existingTranslations, filteredFlatTranslations);

  // Add keys from draft to translation.json if they are in Excel
  addKeysFromDraft(existingTranslations, filteredFlatTranslations, draftTranslations);

  writeTranslations(lang, translationFile, existingTranslations);

  // Remove imported keys from draft.translation.json (only if they are now in translation.json)
  removeImportedKeysFromDraft(draftTranslations, Object.keys(filteredFlatTranslations), existingTranslations);
  writeTranslations(lang, draftTranslationFile, draftTranslations);
}

console.log(`Translations imported successfully from ${excelFilePath}`);
