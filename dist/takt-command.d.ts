export type EventType = 'pull_request' | 'issue_comment' | 'unknown';
export interface TaktCommand {
    command: 'run' | 'unknown';
    workflow?: string;
    instruction: string;
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
 * Supports: "@takt run", "@takt run <workflow>", "@takt <instruction>"
 */
export declare function parseSubcommand(commentBody: string): TaktCommand;
//# sourceMappingURL=takt-command.d.ts.map