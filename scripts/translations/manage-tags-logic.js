/**
 * Pure tag-processing logic for Tolgee manage-tags (unit-testable, no I/O).
 */

import { isKeyPathUsedInOtherProjectNamespace } from './translation-utils.js';

// JIRA ticket ID pattern (e.g., OPHJOD-1234)
export const JIRA_TICKET_PATTERN = /\b(OPHJOD-\d+)\b/;

/**
 * Append deprecated + optional JIRA tag (uses original currentTags for JIRA presence check).
 */
export function pushDeprecatedAndJira(newTags, currentTags, jiraTicketId) {
  newTags.push('deprecated');
  if (jiraTicketId && !currentTags.includes(jiraTicketId)) {
    newTags.push(jiraTicketId);
  }
}

/** Task 1–2: shared namespace ↔ defaultNamespace tag */
export function applySharedNamespaceTagRules(s) {
  if (s.keyNamespace !== s.sharedNamespace) {
    return;
  }
  const nsLabel = s.sharedNamespace;
  if (s.isUsed && !s.currentTags.includes(s.defaultNamespace)) {
    console.log(`   + Adding "${s.defaultNamespace}" tag to ${nsLabel}:${s.keyName}`);
    s.newTags.push(s.defaultNamespace);
    s.needsUpdate = true;
    s.taggedCount++;
    return;
  }
  if (!s.isUsed && s.currentTags.includes(s.defaultNamespace)) {
    console.log(`   - Removing "${s.defaultNamespace}" tag from ${nsLabel}:${s.keyName}`);
    s.newTags = s.newTags.filter((tag) => tag !== s.defaultNamespace);
    s.needsUpdate = true;
    s.untaggedCount++;
  }
}

/** Task 4: remove deprecated when key is used again */
export function removeDeprecatedWhenInUse(s) {
  if (!s.isUsed || !s.currentTags.includes('deprecated')) {
    return;
  }
  const jiraTagsToRemove = s.currentTags.filter((tag) => JIRA_TICKET_PATTERN.test(tag));
  const jiraInfo = jiraTagsToRemove.length > 0 ? ` and JIRA tag(s): ${jiraTagsToRemove.join(', ')}` : '';
  console.log(`   ♻️  Removing "deprecated" tag from ${s.keyNamespace}:${s.keyName}${jiraInfo}`);
  s.newTags = s.newTags.filter((tag) => tag !== 'deprecated');
  s.newTags = s.newTags.filter((tag) => !JIRA_TICKET_PATTERN.test(tag));
  s.needsUpdate = true;
  s.undeprecatedCount++;
}

/** Task 3: unused and no remaining tags → deprecated */
export function deprecateWhenUnusedAndTagless(s) {
  if (s.isUsed || s.newTags.length > 0) {
    return;
  }
  const ticketInfo = s.jiraTicketId ? ` (${s.jiraTicketId})` : '';
  console.log(`   📌 Adding "deprecated" tag to ${s.keyNamespace}:${s.keyName}${ticketInfo}`);
  pushDeprecatedAndJira(s.newTags, s.currentTags, s.jiraTicketId);
  s.needsUpdate = true;
  s.deprecatedCount++;
}

/** Task 5: namespace migration — same key path used in another project namespace */
export function deprecateWhenUnusedElsewhere(s) {
  const shouldDeprecate =
    !s.isUsed &&
    !s.newTags.includes('deprecated') &&
    s.codeKeysByNamespace &&
    s.projectNamespaces &&
    isKeyPathUsedInOtherProjectNamespace(s.keyName, s.keyNamespace, s.codeKeysByNamespace, s.projectNamespaces);
  if (!shouldDeprecate) {
    return;
  }
  const ticketInfo = s.jiraTicketId ? ` (${s.jiraTicketId})` : '';
  console.log(`   📌 Adding "deprecated" tag (namespace migration) to ${s.keyNamespace}:${s.keyName}${ticketInfo}`);
  pushDeprecatedAndJira(s.newTags, s.currentTags, s.jiraTicketId);
  s.needsUpdate = true;
  s.deprecatedCount++;
}

/**
 * Process tag updates for a single key.
 *
 * @param {object} input
 * @param {string} input.keyNamespace
 * @param {string} input.keyName
 * @param {string[]} input.currentTags
 * @param {boolean} input.isUsed
 * @param {string} input.defaultNamespace
 * @param {string} input.sharedNamespace - from .tolgeerc.json (e.g. shared / "common" keys)
 * @param {string|null} [input.jiraTicketId]
 * @param {Record<string, Set<string>>|null} [input.codeKeysByNamespace]
 * @param {string[]|null} [input.projectNamespaces]
 */
export function processKeyTags(input) {
  const s = {
    ...input,
    newTags: [...input.currentTags],
    needsUpdate: false,
    taggedCount: 0,
    untaggedCount: 0,
    deprecatedCount: 0,
    undeprecatedCount: 0,
  };

  applySharedNamespaceTagRules(s);
  removeDeprecatedWhenInUse(s);
  deprecateWhenUnusedAndTagless(s);
  deprecateWhenUnusedElsewhere(s);

  return {
    newTags: s.newTags,
    needsUpdate: s.needsUpdate,
    taggedCount: s.taggedCount,
    untaggedCount: s.untaggedCount,
    deprecatedCount: s.deprecatedCount,
    undeprecatedCount: s.undeprecatedCount,
  };
}
