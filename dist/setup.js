import * as core from '@actions/core';
import * as exec from '@actions/exec';
/**
 * Install takt CLI globally if not already installed.
 * Checks if takt is already available before installing.
 */
export async function ensureTaktInstalled() {
    try {
        // Check if takt is already installed
        await exec.exec('takt', ['--version'], { silent: true });
        core.info('takt CLI is already installed');
    }
    catch {
        // takt not found, install it
        core.info('Installing takt CLI...');
        await exec.exec('npm', ['install', '-g', 'takt']);
        core.info('takt CLI installed successfully');
    }
}
//# sourceMappingURL=setup.js.map