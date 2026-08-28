#!/usr/bin/env node

/**
 * Tolgee JIRA Tag Repair Script
 *
 * One-off maintenance tool for keys that were tagged `deprecated` with the wrong JIRA ticket.
 *
 * Before per-key attribution existed, manage-tags tagged a deprecated key with whatever ticket
 * the sweeping run happened to resolve - which was not necessarily the ticket that removed the
 * key, and in CI was frequently a different ticket entirely. This script re-derives the correct
 * ticket from git history and rewrites the tag.
 *
 * Safety rules:
 * - Read-only by default. Nothing is written to Tolgee without --apply.
 * - Only keys already tagged `deprecated` and still unused in code are touched.
 * - Only a ticket attributed to a real removing commit is written. Keys whose history cannot be
 *   resolved are reported as unresolved and left exactly as they are.
 * - The `deprecated` tag and every non-JIRA tag are preserved.
 *
 * Environment variables:
 *   TOLGEE_API_KEY - Required. Tolgee API key for authentication.
 *
 * Usage:
 *   TOLGEE_API_KEY=your_api_key node scripts/translations/repair-jira-tags.js
 *   TOLGEE_API_KEY=your_api_key node scripts/translations/repair-jira-tags.js --apply
 *
 * Options:
 *   --apply         Write the repairs to Tolgee. Without it the script only reports.
 *   --limit=N       Stop after planning N repairs. Useful for a cautious first --apply.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { extractKeysFromCode, logCodeKeysStats } from './code-keys.js';
import { createGitRunner, createKeyTicketResolver } from './jira-attribution.js';
import { findJiraTags, planJiraTagRepair } from './repair-jira-tags-logic.js';
import { getTolgeeKeys, updateKeyTags } from './tolgee-api.js';
import { getTolgeeConfigPathFromScriptsDir, readAndValidateTolgeeConfig } from './tolgee-config.js';
import { buildCodeKeysByNamespaceFromMap, isKeyPathUsedInNamespace } from './translation-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.join(__dirname, '../..');
const SRC_DIR = path.join(REPO_ROOT, 'src');

function parseOptions(argv) {
  const args = argv.slice(2);
  const limitArg = args.find((arg) => arg.startsWith('--limit='));
  const limit = limitArg ? Number.parseInt(limitArg.slice('--limit='.length), 10) : Number.POSITIVE_INFINITY;

  if (Number.isNaN(limit) || limit <= 0) {
    throw new Error(`Invalid --limit value: ${limitArg}`);
  }

  return { apply: args.includes('--apply'), limit };
}

function printBanner(apply) {
  console.log('🔧 Tolgee JIRA Tag Repair\n');
  console.log(
    apply
      ? '⚠️  APPLY MODE — repairs will be written to Tolgee.\n'
      : '🔍 REPORT ONLY — nothing will be written. Re-run with --apply to write.\n',
  );
}

function describeChange(namespace, keyName, plan) {
  const from = plan.from.length > 0 ? plan.from.join(', ') : '(none)';
  return `${namespace}:${keyName}  ${from} → ${plan.to}`;
}

function describeUnresolved(entry) {
  const tags = findJiraTags(entry.currentTags);
  const held = tags.length > 0 ? ` (has ${tags.join(', ')})` : '';
  return `   • ${entry.namespace}:${entry.keyName}${held}`;
}

/**
 * Classify one Tolgee key and record it in `results`.
 *
 * @returns {object | null} the entry that needs writing, or null when there is nothing to do
 */
function planKeyRepair(tolgeeKey, ctx, results) {
  const { defaultNamespace, projectNamespaces, codeKeysByNamespace, resolveTicketForKey, limit } = ctx;

  const namespace = tolgeeKey.keyNamespace || defaultNamespace;
  if (!projectNamespaces.includes(namespace)) {
    return null;
  }

  const keyName = tolgeeKey.keyName;
  const currentKeyTags = tolgeeKey.keyTags || [];
  const currentTags = currentKeyTags.map((tag) => tag.name);
  const reachedLimit = results.fixes.length + results.backfills.length >= limit;

  const plan = planJiraTagRepair({
    currentTags,
    isUsed: isKeyPathUsedInNamespace(keyName, codeKeysByNamespace[namespace]),
    // Skipping the lookup once the limit is reached keeps a --limit run fast.
    resolveTicket: () => (reachedLimit ? null : resolveTicketForKey(keyName)),
  });

  if (plan.action === 'skip-not-deprecated') {
    return null;
  }
  results.counts.examined++;

  switch (plan.action) {
    case 'skip-in-use':
      results.counts.inUse++;
      return null;
    case 'ok':
      results.counts.ok++;
      return null;
    case 'unresolved':
      if (!reachedLimit) {
        results.unresolved.push({ namespace, keyName, currentTags });
      }
      return null;
    default:
      break;
  }

  const entry = { namespace, keyName, plan, keyId: tolgeeKey.keyId, currentKeyTags };
  (plan.action === 'fix' ? results.fixes : results.backfills).push(entry);
  return entry;
}

function printSummary(apply, counts, fixes, backfills, unresolved) {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(
    apply
      ? '                          SUMMARY                          '
      : '                       REPORT SUMMARY                      ',
  );
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log(`Deprecated keys examined:        ${counts.examined}`);
  console.log(`  already correct:               ${counts.ok}`);
  console.log(`  wrong ticket ${apply ? 'repaired ' : 'to repair'}:        ${fixes.length}`);
  console.log(`  missing ticket ${apply ? 'added   ' : 'to add  '}:        ${backfills.length}`);
  console.log(`  unresolved (left untouched):   ${unresolved.length}`);
  console.log(`  back in use (left to manage-tags): ${counts.inUse}\n`);

  if (unresolved.length > 0) {
    console.log('Unresolved keys — no removing commit found in history, tags left as they are:');
    for (const entry of unresolved.slice(0, 20)) {
      console.log(describeUnresolved(entry));
    }
    if (unresolved.length > 20) {
      console.log(`   … and ${unresolved.length - 20} more`);
    }
    console.log('');
  }

  if (!apply && fixes.length + backfills.length > 0) {
    console.log('Nothing was written. Re-run with --apply to write these repairs.\n');
  } else if (apply) {
    console.log('🎉 Done!\n');
  } else {
    console.log('Nothing to repair.\n');
  }
}

async function main() {
  let options;
  try {
    options = parseOptions(process.argv);
  } catch (error) {
    console.error(`❌ ${error.message}\n`);
    process.exit(1);
  }

  const { apply, limit } = options;
  printBanner(apply);

  const apiKey = process.env.TOLGEE_API_KEY;
  if (!apiKey) {
    console.error('❌ Error: TOLGEE_API_KEY environment variable is required');
    console.error('   Usage: TOLGEE_API_KEY=your_api_key node scripts/translations/repair-jira-tags.js [--apply]\n');
    process.exit(1);
  }

  try {
    const validated = readAndValidateTolgeeConfig(getTolgeeConfigPathFromScriptsDir());
    const { projectId, defaultNamespace, projectNamespaces } = validated;

    console.log(`📝 Project ID: ${projectId}`);
    console.log(`📝 Project namespaces: ${projectNamespaces.join(', ')}\n`);

    console.log('🔍 Extracting translation keys from code...');
    const codeKeys = extractKeysFromCode(SRC_DIR, defaultNamespace);
    const codeKeysByNamespace = buildCodeKeysByNamespaceFromMap(codeKeys);
    logCodeKeysStats(codeKeys, codeKeysByNamespace);

    console.log('🌐 Fetching translation keys from Tolgee...');
    const tolgeeKeys = await getTolgeeKeys(projectId, apiKey);
    console.log(`   Found ${tolgeeKeys.length} keys in Tolgee\n`);

    // No fallback ticket: a repair must be backed by real history, never by a guess.
    const resolveTicketForKey = createKeyTicketResolver({
      runGit: createGitRunner(REPO_ROOT),
      fallbackTicketId: null,
      maxLookups: Number.POSITIVE_INFINITY,
    });

    const ctx = { defaultNamespace, projectNamespaces, codeKeysByNamespace, resolveTicketForKey, limit };
    const results = { counts: { examined: 0, ok: 0, inUse: 0 }, fixes: [], backfills: [], unresolved: [] };

    console.log('📋 Checking deprecated keys...\n');

    for (const tolgeeKey of tolgeeKeys) {
      const entry = planKeyRepair(tolgeeKey, ctx, results);
      if (!entry) {
        continue;
      }

      const marker = entry.plan.action === 'fix' ? '🔁' : '➕';
      console.log(`   ${marker} ${describeChange(entry.namespace, entry.keyName, entry.plan)}`);

      if (apply) {
        await updateKeyTags(projectId, apiKey, entry.keyId, entry.plan.newTags, entry.currentKeyTags);
      }
    }

    printSummary(apply, results.counts, results.fixes, results.backfills, results.unresolved);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

await main();
