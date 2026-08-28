import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createKeyTicketResolver,
  parseBranchTicketId,
  parseJiraTicketId,
  resolveRunTicketId,
} from './jira-attribution.js';

type GitRunner = (args: string[]) => string;

/**
 * Fake git that answers from a route table. Any unrouted command throws, the way git exits
 * non-zero for a failed `grep` or an unknown revision.
 */
function fakeGit(routes: Record<string, string>): GitRunner {
  return (args: string[]) => {
    const key = args.join(' ');
    if (!(key in routes)) {
      throw new Error(`git failed: ${key}`);
    }
    return routes[key];
  };
}

describe('parseJiraTicketId', () => {
  it('extracts a prefixed ticket id', () => {
    expect(parseJiraTicketId('OPHJOD-3519: Add result-info boxes')).toBe('OPHJOD-3519');
  });

  it('stops at the ticket number in a suffixed branch name', () => {
    expect(parseJiraTicketId('OPHJOD-3426-2')).toBe('OPHJOD-3426');
  });

  it('rejects a bare number by default so commit prose is not misread', () => {
    expect(parseJiraTicketId('2024 dependency cleanup')).toBeNull();
    expect(parseJiraTicketId('3519')).toBeNull();
  });

  it('accepts a bare number when explicitly allowed', () => {
    expect(parseJiraTicketId('3519', { allowBareNumber: true })).toBe('OPHJOD-3519');
  });

  it('returns null for empty or non-string input', () => {
    expect(parseJiraTicketId('')).toBeNull();
    expect(parseJiraTicketId('   ')).toBeNull();
    expect(parseJiraTicketId(undefined)).toBeNull();
    expect(parseJiraTicketId('no ticket here')).toBeNull();
  });
});

describe('parseBranchTicketId', () => {
  it('reads a prefixed branch', () => {
    expect(parseBranchTicketId('OPHJOD-3514')).toBe('OPHJOD-3514');
  });

  it('reads a bare-number branch, the naming style that broke tagging', () => {
    expect(parseBranchTicketId('3519')).toBe('OPHJOD-3519');
  });

  it('reads a bare number from a path-style branch', () => {
    expect(parseBranchTicketId('feature/3519-result-info-boxes')).toBe('OPHJOD-3519');
  });

  it('returns null when there is no ticket', () => {
    expect(parseBranchTicketId('dependabot/npm_and_yarn/vite-7')).toBeNull();
    expect(parseBranchTicketId('')).toBeNull();
  });
});

describe('resolveRunTicketId', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('prefers an explicit JIRA_TICKET_ID', () => {
    expect(resolveRunTicketId({ JIRA_TICKET_ID: 'OPHJOD-1', PR_TITLE: 'OPHJOD-2: x' })).toEqual({
      ticketId: 'OPHJOD-1',
      source: 'JIRA_TICKET_ID',
    });
  });

  it('ignores an invalid JIRA_TICKET_ID instead of tagging it verbatim', () => {
    expect(resolveRunTicketId({ JIRA_TICKET_ID: 'true', PR_TITLE: 'OPHJOD-2: x' })).toEqual({
      ticketId: 'OPHJOD-2',
      source: 'PR_TITLE',
    });
  });

  it('falls back to the branch when the title has no ticket', () => {
    expect(resolveRunTicketId({ PR_TITLE: 'Bump deps', GITHUB_HEAD_REF: '3519' })).toEqual({
      ticketId: 'OPHJOD-3519',
      source: 'GITHUB_HEAD_REF',
    });
  });

  it('regression: uses the PR title, not HEAD, for a bare-number branch in CI', () => {
    // Reproduces run 32948391743, where branch "3519" fell through to `git log -1` and the
    // post-merge base-branch HEAD yielded OPHJOD-3449 for a PR that was OPHJOD-3519.
    const runGit = vi.fn(() => 'OPHJOD-3449: Update Goals to show only one at a time\n');

    expect(
      resolveRunTicketId(
        {
          GITHUB_ACTIONS: 'true',
          GITHUB_HEAD_REF: '3519',
          PR_TITLE: 'OPHJOD-3519: Add result-info boxes to import/export page in Profile',
        },
        { runGit },
      ),
    ).toEqual({ ticketId: 'OPHJOD-3519', source: 'PR_TITLE' });
    expect(runGit).not.toHaveBeenCalled();
  });

  it('regression: never reads the commit message in CI, even with nothing else to go on', () => {
    const runGit = vi.fn(() => 'OPHJOD-3449: Update Goals to show only one at a time\n');

    expect(resolveRunTicketId({ GITHUB_ACTIONS: 'true', GITHUB_HEAD_REF: 'renovate/vite' }, { runGit })).toEqual({
      ticketId: null,
      source: null,
    });
    expect(runGit).not.toHaveBeenCalled();
  });

  it('uses the local branch outside CI', () => {
    const runGit = fakeGit({ 'rev-parse --abbrev-ref HEAD': 'OPHJOD-3514-skill-limit\n' });

    expect(resolveRunTicketId({}, { runGit })).toEqual({
      ticketId: 'OPHJOD-3514',
      source: 'local git branch',
    });
  });

  it('falls back to the local commit message on a detached HEAD outside CI', () => {
    const runGit = fakeGit({
      'rev-parse --abbrev-ref HEAD': 'HEAD\n',
      'log -1 --pretty=%B': 'OPHJOD-3545: Fix title in index file\n',
    });

    expect(resolveRunTicketId({}, { runGit })).toEqual({
      ticketId: 'OPHJOD-3545',
      source: 'local git commit message',
    });
  });

  it('returns nothing when git is unavailable and no env hints exist', () => {
    expect(resolveRunTicketId({})).toEqual({ ticketId: null, source: null });
  });
});

describe('createKeyTicketResolver', () => {
  const KEY = 'profile.preferences.title';
  const SHA = 'abc123';
  // A single-element pathspec keeps the fake git route keys readable.
  const PATHSPEC = ['src'];

  /** Routes for a key whose last usage was removed in SHA. */
  function removalRoutes(key: string, sha: string, message: string): Record<string, string> {
    return {
      [`log --max-count=1 --format=%H -S${key} -- src`]: `${sha}\n`,
      [`grep --quiet --fixed-strings ${key} ${sha}^ -- src`]: '',
      [`log -1 --format=%B ${sha}`]: message,
      // `grep ... ${sha} -- src` is intentionally unrouted: the key is gone at that commit.
    };
  }

  it('returns the ticket of the commit that removed the key', () => {
    const resolve = createKeyTicketResolver({
      runGit: fakeGit(removalRoutes(KEY, SHA, 'OPHJOD-3402: Modify profile front page translations\n')),
      fallbackTicketId: 'OPHJOD-9999',
      pathspec: PATHSPEC,
    });

    expect(resolve(KEY)).toBe('OPHJOD-3402');
  });

  it('falls back when the commit only added the key', () => {
    // Present both before and after means this was an addition, not a removal - the shape of a
    // key that is referenced dynamically and therefore invisible to the static scan.
    const runGit = fakeGit({
      [`log --max-count=1 --format=%H -S${KEY} -- src`]: `${SHA}\n`,
      [`grep --quiet --fixed-strings ${KEY} ${SHA}^ -- src`]: '',
      [`grep --quiet --fixed-strings ${KEY} ${SHA} -- src`]: '',
      [`log -1 --format=%B ${SHA}`]: 'OPHJOD-3402: Modify profile front page translations\n',
    });

    expect(createKeyTicketResolver({ runGit, fallbackTicketId: 'OPHJOD-9999', pathspec: PATHSPEC })(KEY)).toBe(
      'OPHJOD-9999',
    );
  });

  it('falls back when the removing commit message has no ticket', () => {
    const resolve = createKeyTicketResolver({
      runGit: fakeGit(removalRoutes(KEY, SHA, 'Initial import\n')),
      fallbackTicketId: 'OPHJOD-9999',
      pathspec: PATHSPEC,
    });

    expect(resolve(KEY)).toBe('OPHJOD-9999');
  });

  it('retries a plural key against its base key', () => {
    const routes = removalRoutes('items', SHA, 'OPHJOD-3410: Update Tavoitteet functionality\n');
    // The plural variant itself never appears in code, so its pickaxe search finds nothing.
    const resolve = createKeyTicketResolver({ runGit: fakeGit(routes), fallbackTicketId: null, pathspec: PATHSPEC });

    expect(resolve('items_other')).toBe('OPHJOD-3410');
  });

  it('memoizes per key', () => {
    const inner = fakeGit(removalRoutes(KEY, SHA, 'OPHJOD-3402: Modify profile\n'));
    const runGit = vi.fn(inner);
    const resolve = createKeyTicketResolver({ runGit, fallbackTicketId: null, pathspec: PATHSPEC });

    expect(resolve(KEY)).toBe('OPHJOD-3402');
    const callsAfterFirst = runGit.mock.calls.length;
    expect(resolve(KEY)).toBe('OPHJOD-3402');
    expect(runGit.mock.calls).toHaveLength(callsAfterFirst);
  });

  it('stops looking up history past maxLookups', () => {
    const runGit = vi.fn(() => {
      throw new Error('git failed');
    });
    const resolve = createKeyTicketResolver({
      runGit,
      fallbackTicketId: 'OPHJOD-9999',
      maxLookups: 1,
      pathspec: PATHSPEC,
    });

    expect(resolve('a')).toBe('OPHJOD-9999');
    const callsAfterFirst = runGit.mock.calls.length;
    expect(resolve('b')).toBe('OPHJOD-9999');
    expect(runGit.mock.calls).toHaveLength(callsAfterFirst);
  });

  it('returns the fallback without touching git when disabled', () => {
    const runGit = vi.fn(() => '');
    const resolve = createKeyTicketResolver({
      runGit,
      fallbackTicketId: 'OPHJOD-9999',
      enabled: false,
      pathspec: PATHSPEC,
    });

    expect(resolve(KEY)).toBe('OPHJOD-9999');
    expect(runGit).not.toHaveBeenCalled();
  });

  it('returns null when there is neither history nor a fallback', () => {
    const runGit = fakeGit({});
    expect(createKeyTicketResolver({ runGit, fallbackTicketId: null, pathspec: PATHSPEC })(KEY)).toBeNull();
  });
});
