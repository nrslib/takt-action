import * as github from '@actions/github';

export type EventType = 'pull_request' | 'issue_comment' | 'unknown';

export interface TaktCommand {
  command: 'run' | 'unknown';
  workflow?: string;
  instruction: string;
}

const TAKT_MENTION_PATTERN = /@takt\b/i;

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
 * Check if a comment body contains a @takt mention.
 */
export function isTaktMention(commentBody: string): boolean {
  return TAKT_MENTION_PATTERN.test(commentBody);
}

/**
 * Parse a subcommand from a @takt mention comment.
 * Supports: "@takt run", "@takt run <workflow>", "@takt <instruction>"
 */
export function parseSubcommand(commentBody: string): TaktCommand {
  const stripped = commentBody.replace(TAKT_MENTION_PATTERN, '').trim();

  const runMatch = /^run(?:\s+(\S+))?(?:\s+(.*))?$/is.exec(stripped);
  if (runMatch) {
    return {
      command: 'run',
      workflow: runMatch[1] || undefined,
      instruction: runMatch[2]?.trim() || '',
    };
  }

  return {
    command: 'unknown',
    instruction: stripped,
  };
}
