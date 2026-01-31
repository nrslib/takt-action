import * as github from '@actions/github';

export type EventType = 'pull_request' | 'issue_comment' | 'unknown';

export interface TaktCommand {
  command: 'run' | 'unknown';
  workflow?: string;
  instruction: string;
  options: Record<string, string>;
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
  const runMatch = /^run\b/i.exec(stripped);

  if (!runMatch) {
    return {
      command: 'unknown',
      instruction: stripped,
      options: {},
    };
  }

  const remainder = stripped.slice(runMatch[0].length).trim();
  const tokens = remainder.length > 0 ? remainder.split(/\s+/) : [];

  const options: Record<string, string> = {};
  let workflowToken: string | undefined;
  let instruction = '';
  let idx = 0;

  const firstToken = tokens[0];
  if (firstToken && !firstToken.startsWith('--')) {
    workflowToken = firstToken;
    idx = 1;
  }

  while (idx < tokens.length) {
    const token = tokens[idx];
    if (!token) {
      break;
    }
    if (token.startsWith('--')) {
      const key = token.slice(2).toLowerCase();
      const next = tokens[idx + 1];
      if (!key || !next || next.startsWith('--')) {
        instruction = tokens.slice(idx).join(' ');
        break;
      }
      options[key] = next;
      idx += 2;
      continue;
    }

    instruction = tokens.slice(idx).join(' ');
    break;
  }

  const workflow = options.workflow ?? workflowToken;

  return {
    command: 'run',
    workflow,
    instruction: instruction.trim(),
    options,
  };
}
