export interface TaktRunOptions {
    task: string;
    workflow?: string;
    model?: string;
    provider?: string;
    anthropicApiKey?: string;
    openaiApiKey?: string;
}
export interface TaktRunResult {
    exitCode: number;
    stdout: string;
    stderr: string;
}
/**
 * Execute a takt workflow via CLI.
 * Uses --task and --skip-git for non-interactive pipeline execution.
 * Requires takt to be installed globally (see ensureTaktInstalled).
 */
export declare function runTakt(options: TaktRunOptions): Promise<TaktRunResult>;
/**
 * Format takt execution result into a Markdown string suitable for an Issue comment.
 */
export declare function formatRunResult(result: TaktRunResult, workflow: string): string;
