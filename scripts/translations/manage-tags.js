#!/usr/bin/env node

/**
 * Tolgee Tag Management Script
 *
 * This script manages tags in Tolgee for translation keys based on their usage in the project:
 * 1. Tags shared-namespace keys (sharedNamespace in .tolgeerc.json) with the defaultNamespace tag (e.g., "ohjaaja")
 * 2. Removes the defaultNamespace tag from shared-namespace keys NOT used in this project
 * 3. Tags unused keys in project namespaces with "deprecated" if they have no tags
 * 4. Removes "deprecated" tag if key is brought back into use
 * 5. Tags keys as "deprecated" when unused in this namespace but the same key path is used in another project namespace (namespace migration)
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
 *
 * Options:
 *   --dry-run, -n   List planned tag changes only; do not call Tolgee to add or remove tags.
 *                   Still requires TOLGEE_API_KEY to fetch current keys from Tolgee.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { JIRA_TICKET_PATTERN, processKeyTags } from './manage-tags-logic.js';
import { getTolgeeConfigPathFromScriptsDir, readAndValidateTolgeeConfig } from './tolgee-config.js';
import { buildCodeKeysByNamespaceFromMap, extractStaticKeys, isKeyPathUsedInNamespace } from './translation-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const TOLGEE_API_URL = 'https://app.tolgee.io';
const SRC_DIR = path.join(__dirname, '../../src');
const CODE_EXTENSIONS = ['.ts', '.tsx'];

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
 * @param {string[]} newTagNames
 * @param {Array<{ id: number; name: string }>} currentTags
 * @returns {{ tagsToAdd: string[]; tagsToRemove: Array<{ id: number; name: string }> }}
 */
function computeTagDiff(newTagNames, currentTags = []) {
  const currentTagNames = new Set(currentTags.map((t) => t.name));
  const tagsToAdd = newTagNames.filter((name) => !currentTagNames.has(name));
  const tagsToRemove = currentTags.filter((tag) => !newTagNames.includes(tag.name));
  return { tagsToAdd, tagsToRemove };
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
  const { tagsToAdd, tagsToRemove } = computeTagDiff(newTagNames, currentTags);

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
function isKeyUsedInCode(keyName, _namespace, usedKeysInNamespace) {
  return isKeyPathUsedInNamespace(keyName, usedKeysInNamespace);
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

function printScriptBanner(dryRun) {
  console.log('🏷️  Tolgee Tag Management Script\n');
  if (dryRun) {
    console.log('⚠️  DRY RUN — tag changes will not be sent to Tolgee (read-only fetch).\n');
  }
}

function printProjectConfigSummary(projectId, defaultNamespace, sharedNamespace, projectNamespaces) {
  console.log(`📝 Project ID: ${projectId}`);
  console.log(`📝 Default namespace: ${defaultNamespace}`);
  console.log(`📝 Shared namespace: ${sharedNamespace}`);
  console.log(`📝 Project namespaces: ${projectNamespaces.join(', ')}`);
}

function printJiraTicketLine(jiraTicketId) {
  if (jiraTicketId) {
    console.log(`🎫 JIRA Ticket: ${jiraTicketId}`);
  } else {
    console.log(`🎫 JIRA Ticket: Not detected (deprecated keys won't be tagged with ticket ID)`);
  }
  console.log('');
}

function logCodeKeysStats(codeKeys, codeKeysByNamespace) {
  console.log(`   Found ${codeKeys.size} unique keys in code`);
  for (const [namespace, keys] of Object.entries(codeKeysByNamespace)) {
    console.log(`   • ${namespace}: ${keys.size} keys`);
  }
  console.log('');
}

/**
 * @returns {Promise<{ taggedCount: number; untaggedCount: number; deprecatedCount: number; undeprecatedCount: number } | null>}
 */
async function applyTolgeeKeyTagChanges(tolgeeKey, options) {
  const {
    defaultNamespace,
    projectNamespaces,
    codeKeysByNamespace,
    sharedNamespace,
    jiraTicketId,
    projectId,
    apiKey,
    dryRun,
  } = options;

  const keyNamespace = tolgeeKey.keyNamespace || defaultNamespace;
  const keyName = tolgeeKey.keyName;
  const keyId = tolgeeKey.keyId;
  const currentTags = (tolgeeKey.keyTags || []).map((tag) => tag.name);

  if (!projectNamespaces.includes(keyNamespace)) {
    return null;
  }

  const isUsed = isKeyUsedInCode(keyName, keyNamespace, codeKeysByNamespace[keyNamespace]);
  const result = processKeyTags({
    keyNamespace,
    keyName,
    currentTags,
    isUsed,
    defaultNamespace,
    sharedNamespace,
    jiraTicketId,
    codeKeysByNamespace,
    projectNamespaces,
  });

  if (!result.needsUpdate) {
    return null;
  }

  const currentKeyTags = tolgeeKey.keyTags || [];
  if (dryRun) {
    const { tagsToAdd, tagsToRemove } = computeTagDiff(result.newTags, currentKeyTags);
    const parts = [];
    if (tagsToAdd.length) {
      parts.push(`add: ${tagsToAdd.join(', ')}`);
    }
    if (tagsToRemove.length) {
      parts.push(`remove: ${tagsToRemove.map((t) => t.name).join(', ')}`);
    }
    if (parts.length) {
      console.log(`   [dry-run] ${keyNamespace}:${keyName} → ${parts.join(' | ')}`);
    }
  } else {
    await updateKeyTags(projectId, apiKey, keyId, keyName, keyNamespace, result.newTags, currentKeyTags);
  }

  return {
    taggedCount: result.taggedCount,
    untaggedCount: result.untaggedCount,
    deprecatedCount: result.deprecatedCount,
    undeprecatedCount: result.undeprecatedCount,
  };
}

function printTagRunSummary(dryRun, counts, sharedNamespace, defaultNamespace) {
  const { taggedCount, untaggedCount, deprecatedCount, undeprecatedCount } = counts;

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(
    dryRun
      ? '                    DRY RUN SUMMARY                         '
      : '                         SUMMARY                               ',
  );
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (dryRun) {
    console.log(`Would tag ${taggedCount} shared-namespace (${sharedNamespace}) key(s) with "${defaultNamespace}"`);
    console.log(
      `Would remove "${defaultNamespace}" tag from ${untaggedCount} shared-namespace (${sharedNamespace}) key(s)`,
    );
    console.log(`Would tag ${deprecatedCount} unused key(s) with "deprecated"`);
    console.log(`Would remove "deprecated" tag from ${undeprecatedCount} key(s) brought back into use\n`);
    console.log('Dry run finished — Tolgee was not modified.\n');
    return;
  }

  console.log(`✅ Tagged ${taggedCount} shared-namespace (${sharedNamespace}) key(s) with "${defaultNamespace}"`);
  console.log(
    `✅ Removed "${defaultNamespace}" tag from ${untaggedCount} shared-namespace (${sharedNamespace}) key(s)`,
  );
  console.log(`✅ Tagged ${deprecatedCount} unused key(s) with "deprecated"`);
  console.log(`✅ Removed "deprecated" tag from ${undeprecatedCount} key(s) brought back into use\n`);
  console.log('🎉 Done!\n');
}

async function main() {
  const argv = new Set(process.argv.slice(2));
  const dryRun = argv.has('--dry-run') || argv.has('-n');

  printScriptBanner(dryRun);

  const apiKey = process.env.TOLGEE_API_KEY;
  if (!apiKey) {
    console.error('❌ Error: TOLGEE_API_KEY environment variable is required');
    console.error('   Usage: TOLGEE_API_KEY=your_api_key node scripts/translations/manage-tags.js [--dry-run|-n]\n');
    process.exit(1);
  }

  try {
    const validated = readAndValidateTolgeeConfig(getTolgeeConfigPathFromScriptsDir());
    const projectId = validated.projectId;
    const defaultNamespace = validated.defaultNamespace;
    const sharedNamespace = validated.sharedNamespace;
    const projectNamespaces = validated.projectNamespaces;

    printProjectConfigSummary(projectId, defaultNamespace, sharedNamespace, projectNamespaces);

    const jiraTicketId = await getJiraTicketId();
    printJiraTicketLine(jiraTicketId);

    console.log('🔍 Extracting translation keys from code...');
    const codeKeys = extractKeysFromCode(defaultNamespace);
    const codeKeysByNamespace = buildCodeKeysByNamespaceFromMap(codeKeys);
    logCodeKeysStats(codeKeys, codeKeysByNamespace);

    console.log('🌐 Fetching translation keys from Tolgee...');
    const tolgeeKeys = await getTolgeeKeys(projectId, apiKey);
    console.log(`   Found ${tolgeeKeys.length} keys in Tolgee\n`);

    let taggedCount = 0;
    let untaggedCount = 0;
    let deprecatedCount = 0;
    let undeprecatedCount = 0;

    console.log('📋 Processing translation keys...\n');

    const tagOptions = {
      defaultNamespace,
      projectNamespaces,
      codeKeysByNamespace,
      sharedNamespace,
      jiraTicketId,
      projectId,
      apiKey,
      dryRun,
    };

    for (const tolgeeKey of tolgeeKeys) {
      const delta = await applyTolgeeKeyTagChanges(tolgeeKey, tagOptions);
      if (delta) {
        taggedCount += delta.taggedCount;
        untaggedCount += delta.untaggedCount;
        deprecatedCount += delta.deprecatedCount;
        undeprecatedCount += delta.undeprecatedCount;
      }
    }

    printTagRunSummary(
      dryRun,
      { taggedCount, untaggedCount, deprecatedCount, undeprecatedCount },
      sharedNamespace,
      defaultNamespace,
    );
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run main function using top-level await
await main();
