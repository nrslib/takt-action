import { describe, it, expect, vi } from 'vitest';
import { parseReviewOutput, postReviewComments } from '../review.js';
import type { ReviewComment } from '../review.js';

vi.mock('@actions/github', () => ({
  getOctokit: vi.fn(),
}));

import * as github from '@actions/github';

describe('parseReviewOutput', () => {
  it('parses valid review block with multiple comments', () => {
    const output = `
Some preamble text
<!-- takt-review -->
src/auth/login.ts:42: エラーハンドリングが不足しています。
src/auth/login.ts:78: この関数は副作用があります。
<!-- /takt-review -->
Some trailing text
`;
    const comments = parseReviewOutput(output);
    expect(comments).toHaveLength(2);
    expect(comments[0]).toEqual({
      path: 'src/auth/login.ts',
      line: 42,
      body: 'エラーハンドリングが不足しています。',
    });
    expect(comments[1]).toEqual({
      path: 'src/auth/login.ts',
      line: 78,
      body: 'この関数は副作用があります。',
    });
  });

  it('returns empty array when no review block exists', () => {
    expect(parseReviewOutput('no block here')).toEqual([]);
  });

  it('returns empty array for empty review block', () => {
    const output = `<!-- takt-review -->
<!-- /takt-review -->`;
    expect(parseReviewOutput(output)).toEqual([]);
  });

  it('skips malformed lines', () => {
    const output = `<!-- takt-review -->
src/file.ts:10: Valid.
not a valid line
src/file.ts:20: Also valid.
<!-- /takt-review -->`;
    const comments = parseReviewOutput(output);
    expect(comments).toHaveLength(2);
    expect(comments[0]?.line).toBe(10);
    expect(comments[1]?.line).toBe(20);
  });

  it('handles single comment', () => {
    const output = `<!-- takt-review -->
src/index.ts:1: Single comment.
<!-- /takt-review -->`;
    const comments = parseReviewOutput(output);
    expect(comments).toHaveLength(1);
    expect(comments[0]).toEqual({
      path: 'src/index.ts',
      line: 1,
      body: 'Single comment.',
    });
  });

  it('handles paths with nested directories', () => {
    const output = `<!-- takt-review -->
src/deep/nested/dir/file.ts:99: Comment on nested file.
<!-- /takt-review -->`;
    const comments = parseReviewOutput(output);
    expect(comments).toHaveLength(1);
    expect(comments[0]?.path).toBe('src/deep/nested/dir/file.ts');
  });
});

describe('postReviewComments', () => {
  it('does nothing when comments array is empty', async () => {
    const mockGetOctokit = vi.mocked(github.getOctokit);
    mockGetOctokit.mockClear();

    await postReviewComments('token', 'owner', 'repo', 1, 'sha123', []);

    expect(mockGetOctokit).not.toHaveBeenCalled();
  });

  it('calls createReview with correct parameters', async () => {
    const mockCreateReview = vi.fn().mockResolvedValue({});
    const mockGetOctokit = vi.mocked(github.getOctokit);
    mockGetOctokit.mockReturnValue({
      rest: {
        pulls: {
          createReview: mockCreateReview,
        },
      },
    } as unknown as ReturnType<typeof github.getOctokit>);

    const comments: ReviewComment[] = [
      { path: 'src/file.ts', line: 10, body: 'Fix this.' },
      { path: 'src/other.ts', line: 20, body: 'And this.' },
    ];

    await postReviewComments('test-token', 'myowner', 'myrepo', 42, 'commit-sha', comments);

    expect(mockGetOctokit).toHaveBeenCalledWith('test-token');
    expect(mockCreateReview).toHaveBeenCalledWith({
      owner: 'myowner',
      repo: 'myrepo',
      pull_number: 42,
      commit_id: 'commit-sha',
      event: 'COMMENT',
      comments: [
        { path: 'src/file.ts', line: 10, side: 'RIGHT', body: 'Fix this.' },
        { path: 'src/other.ts', line: 20, side: 'RIGHT', body: 'And this.' },
      ],
    });
  });
});
