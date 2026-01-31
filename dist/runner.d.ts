export interface TaktRunOptions {
    task: string;
    workflow?: string;
    anthropicApiKey: string;
}
export interface TaktRunResult {
    exitCode: number;
    stdout: string;
    stderr: string;
}
/**
 * Execute a takt workflow via CLI using npx.
 * Uses --task and --skip-git for non-interactive pipeline execution.
 */
export declare function runTakt(options: TaktRunOptions): Promise<TaktRunResult>;
/**
 * Format takt execution result into a Markdown string suitable for an Issue comment.
 */
export declare function formatRunResult(result: TaktRunResult, workflow: string): string;
//# sourceMappingURL=runner.d.ts.map