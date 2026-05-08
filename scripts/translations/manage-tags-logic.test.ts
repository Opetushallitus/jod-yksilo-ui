import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { JIRA_TICKET_PATTERN, processKeyTags, pushDeprecatedAndJira } from './manage-tags-logic.js';

const baseInput = {
  defaultNamespace: 'yksilo',
  sharedNamespace: 'common',
  jiraTicketId: null as string | null,
  codeKeysByNamespace: {} as Record<string, Set<string>>,
  projectNamespaces: ['yksilo', 'common'] as string[],
};

describe('JIRA_TICKET_PATTERN', () => {
  it('matches OPHJOD ticket ids', () => {
    expect(JIRA_TICKET_PATTERN.exec('OPHJOD-2340')?.[1]).toBe('OPHJOD-2340');
  });
});

describe('pushDeprecatedAndJira', () => {
  it('adds JIRA id when provided and not already in current tags', () => {
    const newTags: string[] = [];
    pushDeprecatedAndJira(newTags, [], 'OPHJOD-1');
    expect(newTags).toEqual(['deprecated', 'OPHJOD-1']);
  });

  it('does not duplicate existing JIRA tag', () => {
    const newTags: string[] = [];
    pushDeprecatedAndJira(newTags, ['OPHJOD-1'], 'OPHJOD-1');
    expect(newTags).toEqual(['deprecated']);
  });
});

describe('processKeyTags', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('adds defaultNamespace tag to shared-namespace key when used in code', () => {
    const result = processKeyTags({
      keyNamespace: 'common',
      keyName: 'greeting',
      currentTags: [],
      isUsed: true,
      defaultNamespace: 'yksilo',
      sharedNamespace: 'common',
      jiraTicketId: null,
      codeKeysByNamespace: { common: new Set(['greeting']) },
      projectNamespaces: ['yksilo', 'common'],
    });
    expect(result.needsUpdate).toBe(true);
    expect(result.taggedCount).toBe(1);
    expect(result.newTags).toContain('yksilo');
  });

  it('does not treat default-namespace keys as shared-namespace tagging targets', () => {
    const result = processKeyTags({
      keyNamespace: 'yksilo',
      keyName: 'foo',
      currentTags: [],
      isUsed: true,
      defaultNamespace: 'yksilo',
      sharedNamespace: 'common',
      jiraTicketId: null,
      codeKeysByNamespace: { yksilo: new Set(['foo']) },
      projectNamespaces: ['yksilo', 'common'],
    });
    expect(result.taggedCount).toBe(0);
    expect(result.newTags).toEqual([]);
  });

  it('deprecates unused key with no tags', () => {
    const result = processKeyTags({
      keyNamespace: 'yksilo',
      keyName: 'orphan',
      currentTags: [],
      isUsed: false,
      defaultNamespace: 'yksilo',
      sharedNamespace: 'common',
      jiraTicketId: 'OPHJOD-1',
      codeKeysByNamespace: {},
      projectNamespaces: ['yksilo', 'common'],
    });
    expect(result.deprecatedCount).toBe(1);
    expect(result.newTags).toContain('deprecated');
    expect(result.newTags).toContain('OPHJOD-1');
  });

  it('removes defaultNamespace tag from shared key when no longer used in code', () => {
    const result = processKeyTags({
      ...baseInput,
      keyNamespace: 'common',
      keyName: 'stale',
      currentTags: ['yksilo'],
      isUsed: false,
      codeKeysByNamespace: {},
    });
    expect(result.untaggedCount).toBe(1);
    expect(result.needsUpdate).toBe(true);
    expect(result.newTags).not.toContain('yksilo');
  });

  it('removes deprecated and JIRA tags when key is used again', () => {
    const result = processKeyTags({
      ...baseInput,
      keyNamespace: 'yksilo',
      keyName: 'revived',
      currentTags: ['deprecated', 'OPHJOD-50'],
      isUsed: true,
      codeKeysByNamespace: { yksilo: new Set(['revived']) },
    });
    expect(result.undeprecatedCount).toBe(1);
    expect(result.newTags).not.toContain('deprecated');
    expect(result.newTags).not.toContain('OPHJOD-50');
  });

  it('deprecates key unused in this namespace when same path is used in another namespace', () => {
    const result = processKeyTags({
      ...baseInput,
      keyNamespace: 'yksilo',
      keyName: 'migrated',
      currentTags: [],
      isUsed: false,
      jiraTicketId: 'OPHJOD-2',
      codeKeysByNamespace: {
        yksilo: new Set(),
        common: new Set(['migrated']),
      },
    });
    expect(result.deprecatedCount).toBe(1);
    expect(result.newTags).toContain('deprecated');
    expect(result.newTags).toContain('OPHJOD-2');
  });
});
