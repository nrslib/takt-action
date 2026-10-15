import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ensureTaktInstalled, ensureProviderInstalled } from '../setup.js';
import * as exec from '@actions/exec';
import * as core from '@actions/core';

vi.mock('@actions/exec');
vi.mock('@actions/core');

describe('ensureTaktInstalled', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('skips installation if takt is already installed', async () => {
    vi.mocked(exec.exec).mockResolvedValueOnce(0);

    await ensureTaktInstalled();

    expect(exec.exec).toHaveBeenCalledWith('takt', ['--version'], { silent: true });
    expect(exec.exec).toHaveBeenCalledTimes(1);
    expect(core.info).toHaveBeenCalledWith('takt CLI is already installed');
  });

  it('installs takt from npm if not found (default)', async () => {
    vi.mocked(exec.exec)
      .mockRejectedValueOnce(new Error('Command not found'))
      .mockResolvedValueOnce(0);

    await ensureTaktInstalled('latest');

    expect(exec.exec).toHaveBeenCalledWith('takt', ['--version'], { silent: true });
    expect(exec.exec).toHaveBeenCalledWith('npm', ['install', '-g', 'takt']);
    expect(core.info).toHaveBeenCalledWith('Installing takt CLI from npm...');
    expect(core.info).toHaveBeenCalledWith('takt CLI installed successfully');
  });

  it('installs takt from git if version is "git"', async () => {
    vi.mocked(exec.exec)
      .mockRejectedValueOnce(new Error('Command not found'))
      .mockResolvedValue(0);

    await ensureTaktInstalled('git');

    expect(exec.exec).toHaveBeenCalledWith('takt', ['--version'], { silent: true });
    expect(exec.exec).toHaveBeenCalledWith('git', ['clone', 'https://github.com/nrslib/takt.git', '/tmp/takt']);
    expect(exec.exec).toHaveBeenCalledWith('npm', ['install'], { cwd: '/tmp/takt' });
    expect(exec.exec).toHaveBeenCalledWith('npm', ['run', 'build'], { cwd: '/tmp/takt' });
    expect(exec.exec).toHaveBeenCalledWith('npm', ['link'], { cwd: '/tmp/takt' });
    expect(core.info).toHaveBeenCalledWith('Installing takt CLI from git repository...');
    expect(core.info).toHaveBeenCalledWith('takt CLI installed successfully from git');
  });
});

describe('ensureProviderInstalled', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(exec.exec).mockResolvedValue(0);
  });

  it('installs claude-sdk for the claude alias', async () => {
    await ensureProviderInstalled('claude');

    expect(exec.exec).toHaveBeenCalledWith('takt', ['install', 'claude-sdk']);
    expect(exec.exec).toHaveBeenCalledTimes(1);
  });

  it.each(['claude-sdk', 'codex', 'opencode', 'pi', 'deepseek-harness'])('installs the %s SDK', async (provider) => {
    await ensureProviderInstalled(provider);

    expect(exec.exec).toHaveBeenCalledWith('takt', ['install', provider]);
    expect(exec.exec).toHaveBeenCalledTimes(1);
  });

  it.each(['claude-headless', 'cursor', 'copilot', 'kiro', 'mock'])('skips the CLI-based %s provider', async (provider) => {
    await ensureProviderInstalled(provider);

    expect(exec.exec).not.toHaveBeenCalled();
  });

  it('propagates a failed installation', async () => {
    vi.mocked(exec.exec).mockRejectedValueOnce(new Error('install failed'));

    await expect(ensureProviderInstalled('codex')).rejects.toThrow('install failed');
  });
});
