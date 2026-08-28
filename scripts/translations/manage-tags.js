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
 * The ticket is resolved per key from the commit that removed the key's last usage, so a key
 * keeps the ticket that actually orphaned it even if a later run is the one that notices.
 * The current run's ticket is used as a fallback. See ./jira-attribution.js.
 *
 * Environment variables:
 *   TOLGEE_API_KEY - Required. Tolgee API key for authentication.
 *   JIRA_TICKET_ID - Optional. JIRA ticket ID (e.g., OPHJOD-1234) used as the fallback ticket.
 *   PR_TITLE       - Optional. Pull request title; the authoritative ticket source in CI.
 *   GITHUB_HEAD_REF - Optional. Pull request head branch, used when PR_TITLE has no ticket.
 *
 * Usage:
 *   TOLGEE_API_KEY=your_api_key node scripts/translations/manage-tags.js
 *   TOLGEE_API_KEY=your_api_key JIRA_TICKET_ID=OPHJOD-1234 node scripts/translations/manage-tags.js
 *
 * Options:
 *   --dry-run, -n       List planned tag changes only; do not call Tolgee to add or remove tags.
 *                       Still requires TOLGEE_API_KEY to fetch current keys from Tolgee.
 *   --no-attribution    Skip per-key git history lookups and tag every deprecated key with the
 *                       current run's ticket instead.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { extractKeysFromCode, logCodeKeysStats } from './code-keys.js';
import { createGitRunner, createKeyTicketResolver, resolveRunTicketId } from './jira-attribution.js';
import { processKeyTags } from './manage-tags-logic.js';
import { computeTagDiff, getTolgeeKeys, updateKeyTags } from './tolgee-api.js';
import { getTolgeeConfigPathFromScriptsDir, readAndValidateTolgeeConfig } from './tolgee-config.js';
import { buildCodeKeysByNamespaceFromMap, isKeyPathUsedInNamespace } from './translation-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const REPO_ROOT = path.join(__dirname, '../..');
const SRC_DIR = path.join(REPO_ROOT, 'src');

/**
 * Check if a key is used in code (accounting for plural forms)
 */
function isKeyUsedInCode(keyName, _namespace, usedKeysInNamespace) {
  return isKeyPathUsedInNamespace(keyName, usedKeysInNamespace);
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

function printJiraTicketLine({ ticketId, source }, attribution) {
  if (ticketId) {
    console.log(`🎫 JIRA Ticket: ${ticketId} (source: ${source})`);
  } else {
    console.log(`🎫 JIRA Ticket: Not detected (deprecated keys won't be tagged with ticket ID)`);
  }
  console.log(
    attribution
      ? '🔎 Per-key attribution: on (ticket read from the commit that removed each key)'
      : '🔎 Per-key attribution: off',
  );
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
    resolveTicketForKey,
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

  // Only keys that can still enter a deprecation rule need a ticket, which keeps the git
  // history lookups off the already-deprecated bulk of the key set.
  const needsTicket = !isUsed && !currentTags.includes('deprecated');
  const jiraTicketId = needsTicket ? resolveTicketForKey(keyName) : null;

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
    await updateKeyTags(projectId, apiKey, keyId, result.newTags, currentKeyTags);
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
  const attribution = !argv.has('--no-attribution');

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

    const runGit = createGitRunner(REPO_ROOT);
    const runTicket = resolveRunTicketId(process.env, { runGit });
    printJiraTicketLine(runTicket, attribution);

    const resolveTicketForKey = createKeyTicketResolver({
      runGit,
      fallbackTicketId: runTicket.ticketId,
      enabled: attribution,
    });

    console.log('🔍 Extracting translation keys from code...');
    const codeKeys = extractKeysFromCode(SRC_DIR, defaultNamespace);
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
      resolveTicketForKey,
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
