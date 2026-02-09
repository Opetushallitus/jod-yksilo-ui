#!/usr/bin/env node

/**
 * Tolgee Tag Management Script
 *
 * This script manages tags in Tolgee for translation keys based on their usage in the project:
 * 1. Tags common namespace keys used in this project with the defaultNamespace tag (e.g., "ohjaaja")
 * 2. Removes the defaultNamespace tag from common namespace keys NOT used in this project
 * 3. Tags unused keys in project namespaces with "deprecated" if they have no tags
 * 4. Removes "deprecated" tag if key is brought back into use
 *
 * When tagging keys as deprecated, the script also adds a JIRA ticket ID tag if available.
 * This allows tracking which ticket deprecated the key and when it can be safely removed.
 *
 * Environment variables:
 *   TOLGEE_API_KEY - Required. Tolgee API key for authentication.
 *   JIRA_TICKET_ID - Optional. JIRA ticket ID (e.g., OPHJOD-1234) to tag deprecated keys with.
 *                    If not set, script attempts to parse it from git branch name or commit message.
 *
 * Usage:
 *   TOLGEE_API_KEY=your_api_key node scripts/translations/manage-tags.js
 *   TOLGEE_API_KEY=your_api_key JIRA_TICKET_ID=OPHJOD-1234 node scripts/translations/manage-tags.js
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractStaticKeys, getBaseKey, isPluralKey } from './translation-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const TOLGEE_API_URL = 'https://app.tolgee.io';
const SRC_DIR = path.join(__dirname, '../../src');
const CODE_EXTENSIONS = ['.ts', '.tsx'];
// JIRA ticket ID pattern (e.g., OPHJOD-1234)
const JIRA_TICKET_PATTERN = /\b(OPHJOD-\d+)\b/;

/**
 * Load Tolgee configuration
 */
function loadTolgeeConfig() {
  const configPath = path.join(__dirname, '../../.tolgeerc.json');
  const content = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  return content;
}

/**
 * Get all files with specific extensions recursively
 */
function getAllFiles(dir, extensions, fileList = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!['node_modules', 'dist', 'build', 'coverage', '.git'].includes(file)) {
        getAllFiles(filePath, extensions, fileList);
      }
    } else if (extensions.some((ext) => file.endsWith(ext))) {
      fileList.push(filePath);
    }
  }

  return fileList;
}

/**
 * Extract all translation keys used in code
 */
function extractKeysFromCode(defaultNamespace) {
  const allKeysMap = new Map();
  const files = getAllFiles(SRC_DIR, CODE_EXTENSIONS);

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const relativePath = path.relative(SRC_DIR, file);
    const lines = content.split('\n');

    const keysMap = extractStaticKeys(content, relativePath, defaultNamespace, lines);
    for (const [key, usages] of keysMap.entries()) {
      if (!allKeysMap.has(key)) {
        allKeysMap.set(key, []);
      }
      allKeysMap.get(key).push(...usages);
    }
  }

  return allKeysMap;
}

/**
 * Group keys by namespace
 */
function groupKeysByNamespace(keys) {
  const grouped = {};

  for (const fullKey of keys.keys()) {
    const colonIndex = fullKey.indexOf(':');
    if (colonIndex > 0) {
      const namespace = fullKey.substring(0, colonIndex);
      const key = fullKey.substring(colonIndex + 1);

      if (!grouped[namespace]) {
        grouped[namespace] = new Set();
      }
      grouped[namespace].add(key);
    }
  }

  return grouped;
}

/**
 * Get all translation keys from Tolgee via API
 */
async function getTolgeeKeys(projectId, apiKey) {
  const url = `${TOLGEE_API_URL}/v2/projects/${projectId}/translations`;
  const allKeys = [];
  let page = 0;
  const size = 1000;

  while (true) {
    const response = await fetch(`${url}?size=${size}&page=${page}`, {
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch keys from Tolgee: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    allKeys.push(...data._embedded.keys);

    if (data.page.number >= data.page.totalPages - 1) {
      break;
    }
    page++;
  }

  return allKeys;
}

/**
 * Update tags for a key - adds new tags and removes old ones
 * @param {number} projectId - Tolgee project ID
 * @param {string} apiKey - Tolgee API key
 * @param {number} keyId - Key ID
 * @param {string} keyName - Key name (for logging)
 * @param {string} namespace - Key namespace (for logging)
 * @param {string[]} newTagNames - New tag names that should be on the key
 * @param {Array} currentTags - Current tags on the key (with id and name)
 */
async function updateKeyTags(projectId, apiKey, keyId, keyName, namespace, newTagNames, currentTags = []) {
  const currentTagNames = new Set(currentTags.map((t) => t.name));

  // Find tags to add (in newTagNames but not in currentTagNames)
  const tagsToAdd = newTagNames.filter((name) => !currentTagNames.has(name));

  // Find tags to remove (in currentTagNames but not in newTagNames)
  const tagsToRemove = currentTags.filter((tag) => !newTagNames.includes(tag.name));

  // Add new tags
  for (const tagName of tagsToAdd) {
    const url = `${TOLGEE_API_URL}/v2/projects/${projectId}/keys/${keyId}/tags`;

    const requestBody = {
      name: tagName,
    };

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Failed to add tag "${tagName}" to key ${keyId}: ${response.status} ${response.statusText}\n${errorBody}`,
      );
    }
  }

  // Remove old tags
  for (const tag of tagsToRemove) {
    const url = `${TOLGEE_API_URL}/v2/projects/${projectId}/keys/${keyId}/tags/${tag.id}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'X-API-Key': apiKey,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Failed to remove tag "${tag.name}" from key ${keyId}: ${response.status} ${response.statusText}\n${errorBody}`,
      );
    }
  }

  return true;
}

/**
 * Check if a key is used in code (accounting for plural forms)
 */
function isKeyUsedInCode(keyName, namespace, usedKeysInNamespace) {
  if (!usedKeysInNamespace) {
    return false;
  }

  // Check if the key itself is used
  if (usedKeysInNamespace.has(keyName)) {
    return true;
  }

  // Check if this is a plural form and its base key is used
  if (isPluralKey(keyName)) {
    const baseKey = getBaseKey(keyName);
    if (usedKeysInNamespace.has(baseKey)) {
      return true;
    }
  }

  return false;
}

/**
 * Get JIRA ticket ID from environment variable, git branch, or commit message
 */
async function getJiraTicketId() {
  // 1. Check environment variable (explicitly set, e.g., in GitHub Actions)
  if (process.env.JIRA_TICKET_ID) {
    return process.env.JIRA_TICKET_ID;
  }

  try {
    // 2. Try to get from git branch name (e.g., feature/OPHJOD-1234-description)
    const branchName = process.env.GITHUB_HEAD_REF || '';
    if (branchName) {
      const match = branchName.match(JIRA_TICKET_PATTERN);
      if (match) {
        return match[1];
      }
    }

    // 3. Try to get from latest commit message
    const { execSync } = await import('node:child_process');
    try {
      const commitMessage = execSync('git log -1 --pretty=%B', { encoding: 'utf-8' });
      const match = commitMessage.match(JIRA_TICKET_PATTERN);
      if (match) {
        return match[1];
      }
    } catch {
      // Git command failed, continue without ticket ID
    }
  } catch {
    // Failed to detect ticket ID, continue without it
  }

  return null;
}

/**
 * Process tag updates for a single key
 */
function processKeyTags(keyNamespace, keyName, currentTags, isUsed, defaultNamespace, jiraTicketId = null) {
  let newTags = [...currentTags];
  let needsUpdate = false;
  let taggedCount = 0;
  let untaggedCount = 0;
  let deprecatedCount = 0;
  let undeprecatedCount = 0;

  // Task 1: Tag common namespace keys used in this project with defaultNamespace tag
  if (keyNamespace === 'common' && isUsed && !currentTags.includes(defaultNamespace)) {
    console.log(`   + Adding "${defaultNamespace}" tag to common:${keyName}`);
    newTags.push(defaultNamespace);
    needsUpdate = true;
    taggedCount++;
  }

  // Task 2: Remove defaultNamespace tag from common namespace keys NOT used in this project
  if (keyNamespace === 'common' && !isUsed && currentTags.includes(defaultNamespace)) {
    console.log(`   - Removing "${defaultNamespace}" tag from common:${keyName}`);
    newTags = newTags.filter((tag) => tag !== defaultNamespace);
    needsUpdate = true;
    untaggedCount++;
  }

  // Task 3: Tag unused keys with "deprecated" if they have no tags (after removal)
  if (!isUsed && newTags.length === 0) {
    const ticketInfo = jiraTicketId ? ` (${jiraTicketId})` : '';
    console.log(`   📌 Adding "deprecated" tag to ${keyNamespace}:${keyName}${ticketInfo}`);
    newTags.push('deprecated');
    // Also add JIRA ticket ID tag if available
    if (jiraTicketId && !currentTags.includes(jiraTicketId)) {
      newTags.push(jiraTicketId);
    }
    needsUpdate = true;
    deprecatedCount++;
  }

  // Task 4: Remove "deprecated" tag if key is brought back into use
  if (isUsed && currentTags.includes('deprecated')) {
    // Find all JIRA ticket tags that will be removed
    const jiraTagsToRemove = currentTags.filter((tag) => JIRA_TICKET_PATTERN.test(tag));
    const jiraInfo = jiraTagsToRemove.length > 0 ? ` and JIRA tag(s): ${jiraTagsToRemove.join(', ')}` : '';
    console.log(`   ♻️  Removing "deprecated" tag from ${keyNamespace}:${keyName}${jiraInfo}`);
    newTags = newTags.filter((tag) => tag !== 'deprecated');
    // Also remove any JIRA ticket ID tags when undeprecating
    newTags = newTags.filter((tag) => !JIRA_TICKET_PATTERN.test(tag));
    needsUpdate = true;
    undeprecatedCount++;
  }

  return { newTags, needsUpdate, taggedCount, untaggedCount, deprecatedCount, undeprecatedCount };
}

async function main() {
  console.log('🏷️  Tolgee Tag Management Script\n');

  // Check for API key
  const apiKey = process.env.TOLGEE_API_KEY;
  if (!apiKey) {
    console.error('❌ Error: TOLGEE_API_KEY environment variable is required');
    console.error('   Usage: TOLGEE_API_KEY=your_api_key node scripts/translations/manage-tags.js\n');
    process.exit(1);
  }

  try {
    // Load configuration
    const config = loadTolgeeConfig();
    const projectId = config.projectId;
    const defaultNamespace = config.defaultNamespace;
    const projectNamespaces = config.pull.namespaces || ['yksilo', 'common'];

    console.log(`📝 Project ID: ${projectId}`);
    console.log(`📝 Default namespace: ${defaultNamespace}`);
    console.log(`📝 Project namespaces: ${projectNamespaces.join(', ')}`);

    // Detect JIRA ticket ID
    const jiraTicketId = await getJiraTicketId();
    if (jiraTicketId) {
      console.log(`🎫 JIRA Ticket: ${jiraTicketId}`);
    } else {
      console.log(`🎫 JIRA Ticket: Not detected (deprecated keys won't be tagged with ticket ID)`);
    }
    console.log('');

    // Extract keys used in code
    console.log('🔍 Extracting translation keys from code...');
    const codeKeys = extractKeysFromCode(defaultNamespace);
    const codeKeysByNamespace = groupKeysByNamespace(codeKeys);

    console.log(`   Found ${codeKeys.size} unique keys in code`);
    for (const [namespace, keys] of Object.entries(codeKeysByNamespace)) {
      console.log(`   • ${namespace}: ${keys.size} keys`);
    }
    console.log('');

    // Fetch all keys from Tolgee
    console.log('🌐 Fetching translation keys from Tolgee...');
    const tolgeeKeys = await getTolgeeKeys(projectId, apiKey);
    console.log(`   Found ${tolgeeKeys.length} keys in Tolgee\n`);

    // Process keys
    let taggedCount = 0;
    let untaggedCount = 0;
    let deprecatedCount = 0;
    let undeprecatedCount = 0;

    console.log('📋 Processing translation keys...\n');

    for (const tolgeeKey of tolgeeKeys) {
      const keyNamespace = tolgeeKey.keyNamespace || 'yksilo';
      const keyName = tolgeeKey.keyName;
      const keyId = tolgeeKey.keyId;
      const currentTags = (tolgeeKey.keyTags || []).map((tag) => tag.name);

      // Skip keys not in project namespaces
      if (!projectNamespaces.includes(keyNamespace)) {
        continue;
      }

      const isUsed = isKeyUsedInCode(keyName, keyNamespace, codeKeysByNamespace[keyNamespace]);
      const result = processKeyTags(keyNamespace, keyName, currentTags, isUsed, defaultNamespace, jiraTicketId);

      if (result.needsUpdate) {
        taggedCount += result.taggedCount;
        untaggedCount += result.untaggedCount;
        deprecatedCount += result.deprecatedCount;
        undeprecatedCount += result.undeprecatedCount;

        await updateKeyTags(projectId, apiKey, keyId, keyName, keyNamespace, result.newTags, tolgeeKey.keyTags || []);
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('                         SUMMARY                               ');
    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log(`✅ Tagged ${taggedCount} common namespace key(s) with "${defaultNamespace}"`);
    console.log(`✅ Removed "${defaultNamespace}" tag from ${untaggedCount} common namespace key(s)`);
    console.log(`✅ Tagged ${deprecatedCount} unused key(s) with "deprecated"`);
    console.log(`✅ Removed "deprecated" tag from ${undeprecatedCount} key(s) brought back into use\n`);
    console.log('🎉 Done!\n');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run main function using top-level await
await main();
