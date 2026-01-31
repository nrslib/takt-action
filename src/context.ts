import * as github from '@actions/github';
import * as exec from '@actions/exec';

export type EventType = 'pull_request' | 'issue_comment' | 'unknown';

export interface PrContext {
  owner: string;
  repo: string;
  prNumber: number;
  title: string;
  body: string;
  diff: string;
}

export interface CommentContext {
  owner: string;
  repo: string;
  prNumber: number;
  commentBody: string;
  commentId: number;
  isTaktMention: boolean;
}

/**
 * Detect the event type from the GitHub Actions context.
 */
export function detectEventType(): EventType {
  const eventName = github.context.eventName;
  if (eventName === 'pull_request' || eventName === 'pull_request_target') {
    return 'pull_request';
  }
  if (eventName === 'issue_comment') {
    return 'issue_comment';
  }
  return 'unknown';
}

/**
 * Resolve the PR number from inputs or the GitHub event payload.
 */
export function resolvePrNumber(inputPrNumber?: string): number | undefined {
  if (inputPrNumber) {
    const parsed = parseInt(inputPrNumber, 10);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }

  const payload = github.context.payload;

  if (payload.pull_request?.number) {
    return payload.pull_request.number as number;
  }

  if (payload.issue?.pull_request && payload.issue?.number) {
    return payload.issue.number as number;
  }

  return undefined;
}

/**
 * Fetch the PR diff using the GitHub CLI.
 */
export async function fetchPrDiff(prNumber: number): Promise<string> {
  let output = '';
  await exec.exec('gh', ['pr', 'diff', String(prNumber)], {
    listeners: {
      stdout: (data: Buffer) => {
        output += data.toString();
      },
    },
  });
  return output;
}

/**
 * Fetch PR metadata (title, body) using the GitHub CLI.
 */
export async function fetchPrMetadata(prNumber: number): Promise<{ title: string; body: string }> {
  let output = '';
  await exec.exec('gh', ['pr', 'view', String(prNumber), '--json', 'title,body'], {
    listeners: {
      stdout: (data: Buffer) => {
        output += data.toString();
      },
    },
  });
  const parsed = JSON.parse(output) as { title: string; body: string };
  return { title: parsed.title, body: parsed.body };
}

/**
 * Build a full PR context for the review agent.
 */
export async function buildPrContext(prNumber: number): Promise<PrContext> {
  const { owner, repo } = github.context.repo;
  const [metadata, diff] = await Promise.all([
    fetchPrMetadata(prNumber),
    fetchPrDiff(prNumber),
  ]);

  return {
    owner,
    repo,
    prNumber,
    title: metadata.title,
    body: metadata.body,
    diff,
  };
}

const TAKT_MENTION_PATTERN = /@takt\b/i;

/**
 * Check if a comment body contains a @takt mention.
 */
export function isTaktMention(commentBody: string): boolean {
  return TAKT_MENTION_PATTERN.test(commentBody);
}

/**
 * Extract the instruction text from a @takt mention comment.
 * Removes the @takt prefix and returns the remaining text trimmed.
 */
export function extractInstruction(commentBody: string): string {
  return commentBody.replace(TAKT_MENTION_PATTERN, '').trim();
}

/**
 * Build a comment context from the issue_comment event payload.
 */
export function buildCommentContext(): CommentContext | undefined {
  const payload = github.context.payload;
  const comment = payload.comment;
  const issue = payload.issue;

  if (!comment || !issue?.pull_request) {
    return undefined;
  }

  const { owner, repo } = github.context.repo;
  const commentBody = comment.body as string;

  return {
    owner,
    repo,
    prNumber: issue.number as number,
    commentBody,
    commentId: comment.id as number,
    isTaktMention: isTaktMention(commentBody),
  };
}
