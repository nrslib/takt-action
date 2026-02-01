/**
 * Install takt CLI globally if not already installed.
 * Checks if takt is already available before installing.
 * @param version - Installation source: 'latest' (npm) or 'git' (repository)
 */
export declare function ensureTaktInstalled(version?: string): Promise<void>;
/**
 * Authenticate gh CLI with a GitHub token if not already logged in.
 * This is required because the action uses gh to fetch PR metadata/diffs.
 */
export declare function ensureGitHubCliAuthenticated(githubToken: string): Promise<void>;
/**
 * Configure git user for commits in GitHub Actions environment.
 * Uses GITHUB_ACTOR from the GitHub Actions context.
 */
export declare function configureGitUser(): Promise<void>;
