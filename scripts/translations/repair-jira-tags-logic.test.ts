import { describe, expect, it, vi } from 'vitest';

import { findJiraTags, planJiraTagRepair } from './repair-jira-tags-logic.js';

const base = {
  currentTags: ['deprecated'] as string[],
  isUsed: false,
  resolveTicket: () => 'OPHJOD-3410' as string | null,
};

describe('findJiraTags', () => {
  it('picks out only JIRA tags', () => {
    expect(findJiraTags(['deprecated', 'OPHJOD-3410', 'yksilo', 'do-not-delete'])).toEqual(['OPHJOD-3410']);
  });

  it('returns an empty list when there are none', () => {
    expect(findJiraTags(['deprecated', 'yksilo'])).toEqual([]);
  });
});

describe('planJiraTagRepair', () => {
  it('replaces a wrong ticket with the attributed one', () => {
    const plan = planJiraTagRepair({ ...base, currentTags: ['deprecated', 'OPHJOD-3449'] });

    expect(plan.action).toBe('fix');
    expect(plan.from).toEqual(['OPHJOD-3449']);
    expect(plan.to).toBe('OPHJOD-3410');
    expect(plan.newTags).toEqual(['deprecated', 'OPHJOD-3410']);
  });

  it('backfills a missing ticket', () => {
    const plan = planJiraTagRepair({ ...base, currentTags: ['deprecated'] });

    expect(plan.action).toBe('backfill');
    expect(plan.from).toEqual([]);
    expect(plan.newTags).toEqual(['deprecated', 'OPHJOD-3410']);
  });

  it('leaves an already-correct key alone', () => {
    const plan = planJiraTagRepair({ ...base, currentTags: ['deprecated', 'OPHJOD-3410'] });

    expect(plan.action).toBe('ok');
    expect(plan.newTags).toEqual(['deprecated', 'OPHJOD-3410']);
  });

  it('collapses several JIRA tags into the attributed one', () => {
    const plan = planJiraTagRepair({
      ...base,
      currentTags: ['deprecated', 'OPHJOD-3449', 'OPHJOD-1111'],
    });

    expect(plan.action).toBe('fix');
    expect(plan.from).toEqual(['OPHJOD-3449', 'OPHJOD-1111']);
    expect(plan.newTags).toEqual(['deprecated', 'OPHJOD-3410']);
  });

  it('preserves the deprecated tag and every non-JIRA tag', () => {
    const plan = planJiraTagRepair({
      ...base,
      currentTags: ['yksilo', 'deprecated', 'do-not-delete', 'OPHJOD-3449'],
    });

    expect(plan.newTags).toEqual(['yksilo', 'deprecated', 'do-not-delete', 'OPHJOD-3410']);
  });

  it('does nothing when history could not attribute a ticket', () => {
    const plan = planJiraTagRepair({
      ...base,
      currentTags: ['deprecated', 'OPHJOD-3449'],
      resolveTicket: () => null,
    });

    expect(plan.action).toBe('unresolved');
    expect(plan.newTags).toEqual(['deprecated', 'OPHJOD-3449']);
  });

  it('leaves a key that is back in use to manage-tags', () => {
    const plan = planJiraTagRepair({ ...base, currentTags: ['deprecated', 'OPHJOD-3449'], isUsed: true });

    expect(plan.action).toBe('skip-in-use');
    expect(plan.newTags).toEqual(['deprecated', 'OPHJOD-3449']);
  });

  it('ignores keys that are not deprecated', () => {
    const plan = planJiraTagRepair({ ...base, currentTags: ['yksilo'] });

    expect(plan.action).toBe('skip-not-deprecated');
    expect(plan.newTags).toEqual(['yksilo']);
  });

  it('does not walk history for keys it will not repair', () => {
    // Each lookup is a git pickaxe over full history, so skipped keys must cost nothing.
    const resolveTicket = vi.fn(() => 'OPHJOD-3410');

    planJiraTagRepair({ ...base, currentTags: ['yksilo'], resolveTicket });
    planJiraTagRepair({ ...base, currentTags: ['deprecated', 'OPHJOD-3449'], isUsed: true, resolveTicket });

    expect(resolveTicket).not.toHaveBeenCalled();

    planJiraTagRepair({ ...base, currentTags: ['deprecated', 'OPHJOD-3449'], resolveTicket });
    expect(resolveTicket).toHaveBeenCalledTimes(1);
  });
});
