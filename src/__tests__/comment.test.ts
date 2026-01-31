import { describe, it, expect, vi } from 'vitest';
import { postIssueComment } from '../comment.js';
import * as github from '@actions/github';

vi.mock('@actions/github', () => ({
  getOctokit: vi.fn(),
}));

describe('postIssueComment', () => {
  it('calls octokit.rest.issues.createComment with correct params', async () => {
    const mockCreateComment = vi.fn().mockResolvedValue({});
    vi.mocked(github.getOctokit).mockReturnValue({
      rest: {
        issues: {
          createComment: mockCreateComment,
        },
      },
    } as ReturnType<typeof github.getOctokit>);

    await postIssueComment('fake-token', 'owner', 'repo', 42, 'Hello!');

    expect(github.getOctokit).toHaveBeenCalledWith('fake-token');
    expect(mockCreateComment).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      issue_number: 42,
      body: 'Hello!',
    });
  });
});
