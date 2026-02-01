import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as fs from 'node:fs';
import * as path from 'node:path';
/**
 * Install takt CLI globally if not already installed.
 * Checks if takt is already available before installing.
 * @param version - Installation source: 'latest' (npm) or 'git' (repository)
 */
export async function ensureTaktInstalled(version = 'latest') {
    try {
        await exec.exec('takt', ['--version'], { silent: true });
        core.info('takt CLI is already installed');
    }
    catch {
        if (version === 'git') {
            core.info('Installing takt CLI from git repository...');
            // Clone and build from git for testing unreleased versions
            await exec.exec('git', ['clone', 'https://github.com/nrslib/takt.git', '/tmp/takt']);
            await exec.exec('npm', ['install'], { cwd: '/tmp/takt' });
            await exec.exec('npm', ['run', 'build'], { cwd: '/tmp/takt' });
            await exec.exec('npm', ['link'], { cwd: '/tmp/takt' });
            core.info('takt CLI installed successfully from git');
        }
        else {
            core.info('Installing takt CLI from npm...');
            await exec.exec('npm', ['install', '-g', 'takt']);
            core.info('takt CLI installed successfully');
        }
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
    const configDir = process.env.GH_CONFIG_DIR || path.join('/', 'tmp', 'github-cli');
    fs.mkdirSync(configDir, { recursive: true });
    const env = {
        ...process.env,
        GH_TOKEN: githubToken,
        GITHUB_TOKEN: githubToken,
        GH_CONFIG_DIR: configDir,
    };
    process.env.GH_CONFIG_DIR = configDir;
    process.env.GH_TOKEN = githubToken;
    process.env.GITHUB_TOKEN = githubToken;
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
/**
 * Configure git user for commits in GitHub Actions environment.
 * Uses GITHUB_ACTOR from the GitHub Actions context.
 */
export async function configureGitUser() {
    const actor = process.env.GITHUB_ACTOR || 'github-actions[bot]';
    const email = `${actor}@users.noreply.github.com`;
    core.info(`Configuring git user: ${actor}`);
    await exec.exec('git', ['config', '--global', 'user.name', actor]);
    await exec.exec('git', ['config', '--global', 'user.email', email]);
    core.info('Git user configured');
}
/**
 * Check if GitHub Actions has permission to create pull requests.
 * This verifies the repository setting: "Allow GitHub Actions to create and approve pull requests"
 */
export async function checkPullRequestPermissions() {
    core.info('Checking pull request permissions...');
    try {
        await exec.exec('gh', ['pr', 'list', '--limit', '1'], {
            silent: true,
            ignoreReturnCode: false
        });
        core.info('Pull request permissions verified');
    }
    catch {
        core.warning('⚠️  GitHub Actions may not have permission to create PRs.\n' +
            'If PR creation fails, please enable the following repository setting:\n' +
            '  Settings > Actions > General > Workflow permissions >\n' +
            '  ✓ Allow GitHub Actions to create and approve pull requests');
    }
}
//# sourceMappingURL=setup.js.map