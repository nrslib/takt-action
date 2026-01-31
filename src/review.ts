import * as github from '@actions/github';

export interface ReviewComment {
  path: string;
  line: number;
  body: string;
}

const REVIEW_BLOCK_PATTERN = /<!-- takt-review -->([\s\S]*?)<!-- \/takt-review -->/;
const REVIEW_LINE_PATTERN = /^(.+?):(\d+):\s*(.+)$/;

/**
 * Parse structured review output from a takt review agent.
 * Expected format:
 *   <!-- takt-review -->
 *   src/file.ts:42: Review comment here.
 *   <!-- /takt-review -->
 */
export function parseReviewOutput(output: string): ReviewComment[] {
  const match = REVIEW_BLOCK_PATTERN.exec(output);
  if (!match?.[1]) {
    return [];
  }

  const block = match[1].trim();
  const comments: ReviewComment[] = [];

  for (const line of block.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const lineMatch = REVIEW_LINE_PATTERN.exec(trimmed);
    if (lineMatch?.[1] && lineMatch[2] && lineMatch[3]) {
      comments.push({
        path: lineMatch[1],
        line: parseInt(lineMatch[2], 10),
        body: lineMatch[3],
      });
    }
  }

  return comments;
}

/**
 * Post review comments as PR inline comments using Octokit.
 */
export async function postReviewComments(
  token: string,
  owner: string,
  repo: string,
  prNumber: number,
  commitSha: string,
  comments: ReviewComment[],
): Promise<void> {
  if (comments.length === 0) {
    return;
  }

  const octokit = github.getOctokit(token);

  await octokit.rest.pulls.createReview({
    owner,
    repo,
    pull_number: prNumber,
    commit_id: commitSha,
    event: 'COMMENT',
    comments: comments.map((c) => ({
      path: c.path,
      line: c.line,
      side: 'RIGHT' as const,
      body: c.body,
    })),
  });
}
