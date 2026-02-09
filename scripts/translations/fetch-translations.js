#!/usr/bin/env node

/**
 * Fetch latest translations from Tolgee CDN
 */

import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TOLGEE_CDN_URL = `https://cdn.tolg.ee/eb78073ba177782fd1ea2ffac4c1577b`;
const I18N_DIR = path.resolve(__dirname, '../..', 'src', 'i18n');
const LANGUAGES = ['en', 'fi', 'sv'];

/**
 * Write data to file
 */
function writeToFile(outputPath, data) {
  return new Promise((resolve, reject) => {
    // Ensure file ends with exactly one newline (Prettier requirement)
    const formattedData = data.trimEnd() + '\n';

    fs.writeFile(outputPath, formattedData, 'utf-8', (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Fetch data from URL
 */
function fetchFromUrl(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        if (response.statusCode === 404) {
          resolve({ skipped: true, reason: 'Not found on CDN' });
          return;
        }
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
          return;
        }

        let data = '';
        response.on('data', (chunk) => {
          data += chunk;
        });

        response.on('end', () => {
          resolve({ skipped: false, data });
        });

        response.on('error', (err) => {
          reject(err);
        });
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}

/**
 * Download a file from URL and save it to disk
 */
async function downloadFile(url, outputPath) {
  const result = await fetchFromUrl(url);

  if (result.skipped) {
    return result;
  }

  await writeToFile(outputPath, result.data);
  return { skipped: false };
}

/**
 * Get namespaces from i18n directory
 */
function getNamespaces() {
  const items = fs.readdirSync(I18N_DIR, { withFileTypes: true });
  return items.filter((item) => item.isDirectory()).map((item) => item.name);
}

/**
 * Main function
 */
async function main() {
  console.log('🌐 Fetching latest translations from Tolgee CDN...');

  const namespaces = getNamespaces();
  console.log(`📁 Found namespaces: ${namespaces.join(', ')}\n`);

  let hasErrors = false;
  let totalDownloaded = 0;
  let totalSkipped = 0;

  for (const namespace of namespaces) {
    console.log(`📦 Processing namespace: ${namespace}`);
    const outputDir = path.join(I18N_DIR, namespace);

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    for (const lang of LANGUAGES) {
      const url = `${TOLGEE_CDN_URL}/${namespace}/${lang}.json`;
      const outputPath = path.join(outputDir, `${lang}.json`);

      try {
        console.log(`   Downloading ${lang}.json...`);
        const result = await downloadFile(url, outputPath);

        if (result.skipped) {
          console.log(`   ⊘ ${lang}.json skipped (${result.reason})`);
          totalSkipped++;
        } else {
          console.log(`   ✓ ${lang}.json updated`);
          totalDownloaded++;
        }
      } catch (error) {
        console.error(`   ✗ Failed to download ${lang}.json:`, error.message);
        hasErrors = true;
      }
    }
    console.log(''); // Empty line between namespaces
  }

  console.log(`✅ Translation update complete!`);
  console.log(`   Downloaded: ${totalDownloaded}`);
  console.log(`   Skipped: ${totalSkipped}`);

  if (hasErrors) {
    console.log(`   ⚠️  Some errors occurred during download`);
  }
}

await main();
