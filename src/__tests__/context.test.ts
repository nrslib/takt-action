import { describe, it, expect } from 'vitest';
import { isTaktMention, extractInstruction } from '../context.js';
import { parseReviewOutput } from '../review.js';

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

describe('parseReviewOutput', () => {
  it('parses valid review block', () => {
    const output = `
Some text before
<!-- takt-review -->
src/auth/login.ts:42: Error handling is missing.
src/auth/login.ts:78: This function should be pure.
<!-- /takt-review -->
Some text after
`;
    const comments = parseReviewOutput(output);
    expect(comments).toHaveLength(2);
    expect(comments[0]).toEqual({
      path: 'src/auth/login.ts',
      line: 42,
      body: 'Error handling is missing.',
    });
    expect(comments[1]).toEqual({
      path: 'src/auth/login.ts',
      line: 78,
      body: 'This function should be pure.',
    });
  });

  it('returns empty array when no review block found', () => {
    expect(parseReviewOutput('no review block here')).toEqual([]);
  });

  it('returns empty array for empty review block', () => {
    const output = `<!-- takt-review -->
<!-- /takt-review -->`;
    expect(parseReviewOutput(output)).toEqual([]);
  });

  it('skips malformed lines in review block', () => {
    const output = `<!-- takt-review -->
src/file.ts:10: Valid comment.
this is not a valid line
another invalid line
src/file.ts:20: Another valid comment.
<!-- /takt-review -->`;
    const comments = parseReviewOutput(output);
    expect(comments).toHaveLength(2);
    expect(comments[0]?.line).toBe(10);
    expect(comments[1]?.line).toBe(20);
  });
});
