import * as core from '@actions/core';
import * as exec from '@actions/exec';
/**
 * Install takt CLI globally if not already installed.
 * Checks if takt is already available before installing.
 */
export async function ensureTaktInstalled() {
    try {
        await exec.exec('takt', ['--version'], { silent: true });
        core.info('takt CLI is already installed');
    }
    catch {
        core.info('Installing takt CLI...');
        await exec.exec('npm', ['install', '-g', 'takt']);
        core.info('takt CLI installed successfully');
    }
}
/**
 * Authenticate gh CLI with a GitHub token if not already logged in.
 * This is required because the action uses gh to fetch PR metadata/diffs.
 */
export async function ensureGitHubCliAuthenticated(githubToken) {
    if (!githubToken) {
        throw new Error('github_token input is required to authenticate the gh CLI');
    }
    const env = { ...process.env, GH_TOKEN: githubToken };
    const statusCode = await exec.exec('gh', ['auth', 'status'], {
        env,
        ignoreReturnCode: true,
        silent: true,
    });
    if (statusCode === 0) {
        core.info('gh CLI is already authenticated');
        return;
    }
    core.info('Authenticating gh CLI with github_token');
    await exec.exec('gh', ['auth', 'login', '--with-token'], {
        env,
        input: Buffer.from(githubToken),
        silent: true,
    });
    core.info('gh CLI authenticated');
    process.env.GH_TOKEN = githubToken;
}
//# sourceMappingURL=setup.js.map