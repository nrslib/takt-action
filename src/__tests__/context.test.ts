import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isTaktMention, extractInstruction, formatPrContext, buildIssueCommentContext, buildCommentContext } from '../context.js';
import type { PrContext } from '../context.js';
import * as github from '@actions/github';

vi.mock('@actions/github', () => ({
  context: {
    payload: {},
    repo: { owner: 'test-owner', repo: 'test-repo' },
  },
}));

describe('isTaktMention', () => {
  it('returns true when comment contains @takt', () => {
    expect(isTaktMention('@takt please review this')).toBe(true);
  });

  it('returns true for case-insensitive @takt', () => {
    expect(isTaktMention('@TAKT fix this')).toBe(true);
    expect(isTaktMention('@Takt explain')).toBe(true);
  });

  it('returns false when comment does not contain @takt', () => {
    expect(isTaktMention('just a regular comment')).toBe(false);
  });

  it('returns false for partial match like @takting', () => {
    // \b ensures word boundary
    expect(isTaktMention('@takting something')).toBe(false);
  });

  it('returns true when @takt is at the end', () => {
    expect(isTaktMention('hey @takt')).toBe(true);
  });
});

describe('extractInstruction', () => {
  it('extracts instruction after @takt mention', () => {
    expect(extractInstruction('@takt fix the login bug')).toBe('fix the login bug');
  });

  it('handles @takt at the beginning with extra spaces', () => {
    expect(extractInstruction('@takt   add error handling')).toBe('add error handling');
  });

  it('returns empty string when only @takt is present', () => {
    expect(extractInstruction('@takt')).toBe('');
  });

  it('handles @takt in the middle of text', () => {
    expect(extractInstruction('hey @takt please review')).toBe('hey  please review');
  });
});

describe('formatPrContext', () => {
  const basePrContext: PrContext = {
    owner: 'nrslib',
    repo: 'takt-action',
    prNumber: 123,
    headSha: 'abc123def456',
    title: 'ログイン機能を追加',
    body: 'ログイン機能の実装です。',
    diff: 'diff --git a/src/auth/login.ts b/src/auth/login.ts\n+export function login() {}',
    changedFiles: ['src/auth/login.ts', 'src/auth/login.test.ts'],
  };

  it('formats a complete PR context as structured Markdown', () => {
    const result = formatPrContext(basePrContext);

    expect(result).toContain('## PR #123: ログイン機能を追加');
    expect(result).toContain('ログイン機能の実装です。');
    expect(result).toContain('### 変更ファイル');
    expect(result).toContain('- src/auth/login.ts');
    expect(result).toContain('- src/auth/login.test.ts');
    expect(result).toContain('### Diff');
    expect(result).toContain('diff --git a/src/auth/login.ts b/src/auth/login.ts');
  });

  it('omits body section when body is empty', () => {
    const ctx: PrContext = { ...basePrContext, body: '' };
    const result = formatPrContext(ctx);

    expect(result).toContain('## PR #123: ログイン機能を追加');
    expect(result).toContain('### 変更ファイル');
    // body が空の場合、body セクションが含まれない
    const lines = result.split('\n');
    const headerIndex = lines.findIndex((l) => l.startsWith('## PR #'));
    const changedFilesIndex = lines.findIndex((l) => l === '### 変更ファイル');
    // header の直後（空行を挟んで）が変更ファイルセクション
    expect(changedFilesIndex).toBe(headerIndex + 2);
  });

  it('lists all changed files', () => {
    const ctx: PrContext = {
      ...basePrContext,
      changedFiles: ['a.ts', 'b.ts', 'c.ts'],
    };
    const result = formatPrContext(ctx);

    expect(result).toContain('- a.ts');
    expect(result).toContain('- b.ts');
    expect(result).toContain('- c.ts');
  });

  it('includes diff content at the end', () => {
    const result = formatPrContext(basePrContext);
    const diffSection = result.split('### Diff\n')[1];

    expect(diffSection).toBeDefined();
    expect(diffSection).toContain('+export function login() {}');
  });
});

describe('buildIssueCommentContext', () => {
  function setPayload(payload: Record<string, unknown>) {
    Object.assign(github.context, { payload });
  }

  afterEach(() => {
    setPayload({});
  });

  it('returns IssueCommentContext for an issue comment with @takt mention', () => {
    setPayload({
      comment: { id: 100, body: '@takt help me with this' },
      issue: { number: 42, title: 'Bug report', body: 'Something is broken' },
    });

    const result = buildIssueCommentContext();

    expect(result).toEqual({
      owner: 'test-owner',
      repo: 'test-repo',
      issueNumber: 42,
      commentBody: '@takt help me with this',
      commentId: 100,
      isTaktMention: true,
      issueTitle: 'Bug report',
      issueBody: 'Something is broken',
    });
  });

  it('returns IssueCommentContext with isTaktMention false when no @takt mention', () => {
    setPayload({
      comment: { id: 101, body: 'just a regular comment' },
      issue: { number: 10, title: 'Feature request', body: 'Add dark mode' },
    });

    const result = buildIssueCommentContext();

    expect(result).toBeDefined();
    expect(result!.isTaktMention).toBe(false);
    expect(result!.issueNumber).toBe(10);
  });

  it('returns undefined when comment is on a pull request', () => {
    setPayload({
      comment: { id: 102, body: '@takt review this' },
      issue: { number: 5, title: 'PR title', body: 'PR body', pull_request: { url: 'https://...' } },
    });

    const result = buildIssueCommentContext();

    expect(result).toBeUndefined();
  });

  it('returns undefined when comment is missing', () => {
    setPayload({
      issue: { number: 1, title: 'No comment', body: '' },
    });

    const result = buildIssueCommentContext();

    expect(result).toBeUndefined();
  });

  it('returns undefined when issue is missing', () => {
    setPayload({
      comment: { id: 103, body: '@takt do something' },
    });

    const result = buildIssueCommentContext();

    expect(result).toBeUndefined();
  });

  it('handles empty issue body', () => {
    setPayload({
      comment: { id: 104, body: '@takt fix this' },
      issue: { number: 20, title: 'Minimal issue', body: '' },
    });

    const result = buildIssueCommentContext();

    expect(result).toBeDefined();
    expect(result!.issueBody).toBe('');
    expect(result!.issueTitle).toBe('Minimal issue');
  });
});

describe('buildCommentContext', () => {
  function setPayload(payload: Record<string, unknown>) {
    Object.assign(github.context, { payload });
  }

  afterEach(() => {
    setPayload({});
  });

  it('returns CommentContext for a PR comment', () => {
    setPayload({
      comment: { id: 200, body: '@takt review please' },
      issue: { number: 7, pull_request: { url: 'https://...' } },
    });

    const result = buildCommentContext();

    expect(result).toEqual({
      owner: 'test-owner',
      repo: 'test-repo',
      prNumber: 7,
      commentBody: '@takt review please',
      commentId: 200,
      isTaktMention: true,
    });
  });

  it('returns undefined for an issue comment (no pull_request)', () => {
    setPayload({
      comment: { id: 201, body: '@takt help' },
      issue: { number: 3, title: 'Issue', body: 'body' },
    });

    const result = buildCommentContext();

    expect(result).toBeUndefined();
  });
});
