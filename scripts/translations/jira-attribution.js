/**
 * JIRA ticket resolution for Tolgee tag management.
 *
 * Two levels of resolution:
 * 1. `resolveRunTicketId` - the ticket of the PR the current run belongs to. Used as a fallback.
 * 2. `createKeyTicketResolver` - the ticket of the commit that actually removed a key's last
 *    usage. This is what a deprecated key should be tagged with, because the run that notices
 *    a key is unused is not necessarily the run that stopped using it.
 *
 * All git access goes through an injected `runGit` so the logic is unit-testable without a repo.
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { JIRA_TICKET_PATTERN } from './manage-tags-logic.js';
import { getBaseKey, isPluralKey } from './translation-utils.js';

export const JIRA_PROJECT_PREFIX = 'OPHJOD';

/** Branch names in this repo are either `OPHJOD-1234-foo` or a bare ticket number like `3519`. */
const BARE_TICKET_NUMBER_PATTERN = /^(\d{3,6})(?:[-_.]|$)/;

/**
 * Pickaxe searches are limited to exactly what manage-tags scans for key usages: TS/TSX under
 * src. Including src/i18n/*.json here would make a top-level key such as "add-favorite" look
 * still-present because of its own translation entry.
 */
const GIT_SEARCH_PATHSPEC = [':(glob)src/**/*.ts', ':(glob)src/**/*.tsx'];

/** Upper bound on per-key history lookups in a single run, to bound a large first sweep. */
export const DEFAULT_MAX_LOOKUPS = 200;

/**
 * Absolute locations git is installed in, most standard first. The binary is never looked up by
 * bare name: resolving it through PATH would let a writable directory earlier in PATH shadow it.
 * Set GIT_BINARY to an absolute path for an installation that is not listed here.
 */
const GIT_BINARY_CANDIDATES = ['/usr/bin/git', '/bin/git', '/usr/local/bin/git', '/opt/homebrew/bin/git'];

/**
 * @returns {string} absolute path to the git binary
 * @throws when git cannot be located, which callers degrade on like any other git failure
 */
function resolveGitBinary() {
  const override = process.env.GIT_BINARY;
  if (override) {
    if (!path.isAbsolute(override)) {
      throw new Error(`GIT_BINARY must be an absolute path, got "${override}"`);
    }
    return override;
  }

  const found = GIT_BINARY_CANDIDATES.find((candidate) => fs.existsSync(candidate));
  if (!found) {
    throw new Error(`Could not find git in ${GIT_BINARY_CANDIDATES.join(', ')}. Set GIT_BINARY to its absolute path.`);
  }
  return found;
}

/**
 * Build a git runner bound to a working directory.
 * Returns stdout on success and throws on a non-zero exit.
 *
 * The binary is resolved lazily and memoized, so a run that never touches history (for example
 * --no-attribution) does not require git to be present at all.
 *
 * @param {string} cwd
 * @returns {(args: string[]) => string}
 */
export function createGitRunner(cwd) {
  let gitBinary = null;

  return (args) => {
    gitBinary ??= resolveGitBinary();
    return execFileSync(gitBinary, args, { cwd, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] });
  };
}

/**
 * @param {(args: string[]) => string} runGit
 * @param {string[]} args
 * @returns {string | null} - trimmed stdout, or null if git failed
 */
function tryGit(runGit, args) {
  try {
    return runGit(args).trim();
  } catch {
    return null;
  }
}

/**
 * @param {(args: string[]) => string} runGit
 * @param {string[]} args
 * @returns {boolean} - true when git exited zero
 */
function gitSucceeds(runGit, args) {
  try {
    runGit(args);
    return true;
  } catch {
    return false;
  }
}

/**
 * Parse a JIRA ticket id out of arbitrary text.
 *
 * @param {string | undefined | null} text
 * @param {object} [options]
 * @param {boolean} [options.allowBareNumber] - also accept a bare ticket number (branch names only).
 *   Off by default: a commit message like "2024 cleanup" must not become OPHJOD-2024.
 * @returns {string | null}
 */
export function parseJiraTicketId(text, options = {}) {
  if (typeof text !== 'string' || text.trim().length === 0) {
    return null;
  }

  const match = JIRA_TICKET_PATTERN.exec(text);
  if (match) {
    return match[1];
  }

  if (!options.allowBareNumber) {
    return null;
  }

  const bare = BARE_TICKET_NUMBER_PATTERN.exec(text.trim());
  return bare ? `${JIRA_PROJECT_PREFIX}-${bare[1]}` : null;
}

/**
 * Parse a ticket id from a branch ref, accepting both `OPHJOD-1234-foo` and bare `3519`.
 * Each `/`-separated segment is tried, so `feature/3519-foo` works too.
 *
 * @param {string | undefined | null} ref
 * @returns {string | null}
 */
export function parseBranchTicketId(ref) {
  if (typeof ref !== 'string' || ref.trim().length === 0) {
    return null;
  }

  const withPrefix = parseJiraTicketId(ref);
  if (withPrefix) {
    return withPrefix;
  }

  for (const segment of ref.split('/')) {
    const bare = parseJiraTicketId(segment, { allowBareNumber: true });
    if (bare) {
      return bare;
    }
  }

  return null;
}

/**
 * Resolve the ticket id for the current run.
 *
 * Order: JIRA_TICKET_ID (validated) → PR_TITLE → GITHUB_HEAD_REF → local git (outside CI only).
 *
 * `git log -1` is deliberately NOT consulted in CI: the sync workflow runs on
 * `pull_request: closed`, where actions/checkout checks out the base branch after the merge, so
 * HEAD is whatever was merged last - frequently a different ticket than the PR being processed.
 *
 * @param {Record<string, string | undefined>} [env]
 * @param {object} [options]
 * @param {(args: string[]) => string} [options.runGit]
 * @returns {{ ticketId: string | null; source: string | null }}
 */
export function resolveRunTicketId(env = process.env, options = {}) {
  const { runGit } = options;

  if (env.JIRA_TICKET_ID) {
    const explicit = parseJiraTicketId(env.JIRA_TICKET_ID, { allowBareNumber: true });
    if (explicit) {
      return { ticketId: explicit, source: 'JIRA_TICKET_ID' };
    }
    console.log(
      `⚠️  Ignoring invalid JIRA_TICKET_ID="${env.JIRA_TICKET_ID}" (expected e.g. ${JIRA_PROJECT_PREFIX}-1234)`,
    );
  }

  const fromTitle = parseJiraTicketId(env.PR_TITLE);
  if (fromTitle) {
    return { ticketId: fromTitle, source: 'PR_TITLE' };
  }

  const fromBranch = parseBranchTicketId(env.GITHUB_HEAD_REF);
  if (fromBranch) {
    return { ticketId: fromBranch, source: 'GITHUB_HEAD_REF' };
  }

  if (env.GITHUB_ACTIONS || !runGit) {
    return { ticketId: null, source: null };
  }

  const localBranch = tryGit(runGit, ['rev-parse', '--abbrev-ref', 'HEAD']);
  if (localBranch && localBranch !== 'HEAD') {
    const fromLocalBranch = parseBranchTicketId(localBranch);
    if (fromLocalBranch) {
      return { ticketId: fromLocalBranch, source: 'local git branch' };
    }
  }

  const fromCommit = parseJiraTicketId(tryGit(runGit, ['log', '-1', '--pretty=%B']));
  if (fromCommit) {
    return { ticketId: fromCommit, source: 'local git commit message' };
  }

  return { ticketId: null, source: null };
}

/**
 * Find the most recent commit that changed how many times `needle` occurs under `pathspec`.
 *
 * @param {(args: string[]) => string} runGit
 * @param {string} needle
 * @param {string[]} pathspec
 * @returns {string | null}
 */
function findLastOccurrenceChange(runGit, needle, pathspec) {
  const sha = tryGit(runGit, ['log', '--max-count=1', '--format=%H', `-S${needle}`, '--', ...pathspec]);
  return sha && sha.length > 0 ? sha : null;
}

/**
 * Verify the commit removed the key rather than introduced it.
 *
 * Without this check, a key that is only referenced dynamically (and therefore never seen by the
 * static scan) would be attributed to whoever added it.
 *
 * @param {(args: string[]) => string} runGit
 * @param {string} sha
 * @param {string} needle
 * @param {string[]} pathspec
 * @returns {boolean}
 */
function commitRemovedKey(runGit, sha, needle, pathspec) {
  const grepArgs = (rev) => ['grep', '--quiet', '--fixed-strings', needle, rev, '--', ...pathspec];
  const presentBefore = gitSucceeds(runGit, grepArgs(`${sha}^`));
  const presentAfter = gitSucceeds(runGit, grepArgs(sha));
  return presentBefore && !presentAfter;
}

/**
 * @param {(args: string[]) => string} runGit
 * @param {string} keyName
 * @param {string[]} pathspec
 * @returns {string | null}
 */
function lookupRemovalTicket(runGit, keyName, pathspec) {
  const candidates = [keyName];
  if (isPluralKey(keyName)) {
    candidates.push(getBaseKey(keyName));
  }

  for (const candidate of candidates) {
    const sha = findLastOccurrenceChange(runGit, candidate, pathspec);
    if (!sha || !commitRemovedKey(runGit, sha, candidate, pathspec)) {
      continue;
    }
    const ticket = parseJiraTicketId(tryGit(runGit, ['log', '-1', '--format=%B', sha]));
    if (ticket) {
      return ticket;
    }
  }

  return null;
}

/**
 * Create a memoized resolver returning the ticket that removed a key's last usage,
 * falling back to the current run's ticket.
 *
 * @param {object} options
 * @param {(args: string[]) => string} [options.runGit]
 * @param {string | null} [options.fallbackTicketId]
 * @param {number} [options.maxLookups]
 * @param {boolean} [options.enabled]
 * @param {string[]} [options.pathspec]
 * @returns {(keyName: string) => string | null}
 */
export function createKeyTicketResolver(options = {}) {
  const {
    runGit,
    fallbackTicketId = null,
    maxLookups = DEFAULT_MAX_LOOKUPS,
    enabled = true,
    pathspec = GIT_SEARCH_PATHSPEC,
  } = options;

  const cache = new Map();
  let lookups = 0;

  return function resolveTicketForKey(keyName) {
    if (!enabled || !runGit) {
      return fallbackTicketId;
    }
    if (cache.has(keyName)) {
      return cache.get(keyName);
    }
    if (lookups >= maxLookups) {
      return fallbackTicketId;
    }

    lookups++;
    const ticket = lookupRemovalTicket(runGit, keyName, pathspec) ?? fallbackTicketId;
    cache.set(keyName, ticket);
    return ticket;
  };
}
