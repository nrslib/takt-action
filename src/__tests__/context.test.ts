import { describe, it, expect } from 'vitest';
import { isTaktMention, extractInstruction, formatPrContext } from '../context.js';
import type { PrContext } from '../context.js';

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
