export type EventType = 'pull_request' | 'issue_comment' | 'unknown';
export interface TaktCommand {
    command: 'run' | 'unknown';
    piece?: string;
    instruction: string;
    options: Record<string, string>;
}
/**
 * Detect the event type from the GitHub Actions context.
 */
export declare function detectEventType(): EventType;
/**
 * Check if a comment body contains a @takt mention.
 */
export declare function isTaktMention(commentBody: string): boolean;
/**
 * Parse a subcommand from a @takt mention comment.
 * Supports: "@takt run", "@takt run <piece>", "@takt <instruction>"
 */
export declare function parseSubcommand(commentBody: string): TaktCommand;
