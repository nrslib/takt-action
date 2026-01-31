import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ensureTaktInstalled } from '../setup.js';
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

  it('installs takt if not found', async () => {
    vi.mocked(exec.exec)
      .mockRejectedValueOnce(new Error('Command not found'))
      .mockResolvedValueOnce(0);

    await ensureTaktInstalled();

    expect(exec.exec).toHaveBeenCalledWith('takt', ['--version'], { silent: true });
    expect(exec.exec).toHaveBeenCalledWith('npm', ['install', '-g', 'takt']);
    expect(core.info).toHaveBeenCalledWith('Installing takt CLI...');
    expect(core.info).toHaveBeenCalledWith('takt CLI installed successfully');
  });
});
