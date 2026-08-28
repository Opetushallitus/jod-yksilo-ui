/**
 * Pure decision logic for repairing JIRA ticket tags on already-deprecated Tolgee keys.
 */

import { JIRA_TICKET_PATTERN } from './manage-tags-logic.js';

export const DEPRECATED_TAG = 'deprecated';

/** @param {string[]} tags */
export function findJiraTags(tags) {
  return tags.filter((tag) => JIRA_TICKET_PATTERN.test(tag));
}

/**
 * Decide what a repair run should do with one key.
 *
 * Only keys that are already tagged `deprecated` and are still unused are candidates. A key that
 * is back in use is left alone: manage-tags rule 4 removes its `deprecated` and JIRA tags, and
 * doing it here would duplicate that behaviour in a second place.
 *
 * A repair is only ever driven by a ticket attributed to a real removing commit. Passing the
 * run-level fallback in here would replace one guess with another, which is exactly the failure
 * this whole change is meant to remove.
 *
 * @param {object} input
 * @param {string[]} input.currentTags
 * @param {boolean} input.isUsed
 * @param {() => string|null} input.resolveTicket - looks up the removing commit's ticket. Called
 *   lazily, and only for a key that could actually be repaired, because each call walks git history.
 * @returns {{ action: 'skip-in-use' | 'skip-not-deprecated' | 'unresolved' | 'ok' | 'fix' | 'backfill';
 *             newTags: string[]; from: string[]; to: string | null }}
 */
export function planJiraTagRepair({ currentTags, isUsed, resolveTicket }) {
  const unchanged = (action) => ({ action, newTags: currentTags, from: findJiraTags(currentTags), to: null });

  if (!currentTags.includes(DEPRECATED_TAG)) {
    return unchanged('skip-not-deprecated');
  }
  if (isUsed) {
    return unchanged('skip-in-use');
  }

  const attributedTicketId = resolveTicket();
  if (!attributedTicketId) {
    return unchanged('unresolved');
  }

  const existing = findJiraTags(currentTags);
  if (existing.length === 1 && existing[0] === attributedTicketId) {
    return { action: 'ok', newTags: currentTags, from: existing, to: attributedTicketId };
  }

  // Replace every JIRA tag with the attributed one; all other tags are preserved.
  const newTags = [...currentTags.filter((tag) => !JIRA_TICKET_PATTERN.test(tag)), attributedTicketId];

  return {
    action: existing.length === 0 ? 'backfill' : 'fix',
    newTags,
    from: existing,
    to: attributedTicketId,
  };
}
