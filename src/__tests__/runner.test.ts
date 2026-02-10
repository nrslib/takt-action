import { describe, it, expect } from 'vitest';
import { formatRunResult } from '../runner.js';
import type { TaktRunResult } from '../runner.js';

describe('formatRunResult', () => {
  it('formats a successful result', () => {
    const result: TaktRunResult = {
      exitCode: 0,
      stdout: 'Workflow completed successfully.',
      stderr: '',
    };

    const formatted = formatRunResult(result, 'review');

    expect(formatted).toContain('## TAKT ✅ 完了');
    expect(formatted).toContain('**Piece**: `review`');
    expect(formatted).toContain('Workflow completed successfully.');
  });

  it('formats a failed result with stderr', () => {
    const result: TaktRunResult = {
      exitCode: 1,
      stdout: 'Partial output',
      stderr: 'Error: something went wrong',
    };

    const formatted = formatRunResult(result, 'default');

    expect(formatted).toContain('## TAKT ❌ 失敗');
    expect(formatted).toContain('**Piece**: `default`');
    expect(formatted).toContain('Partial output');
    expect(formatted).toContain('Error: something went wrong');
    expect(formatted).toContain('エラー出力');
  });

  it('does not include error section when stderr is empty on failure', () => {
    const result: TaktRunResult = {
      exitCode: 1,
      stdout: 'Some output',
      stderr: '',
    };

    const formatted = formatRunResult(result, 'default');

    expect(formatted).toContain('## TAKT ❌ 失敗');
    expect(formatted).not.toContain('エラー出力');
  });

  it('does not include stderr section on success even with stderr content', () => {
    const result: TaktRunResult = {
      exitCode: 0,
      stdout: 'Output',
      stderr: 'Warning: something',
    };

    const formatted = formatRunResult(result, 'default');

    expect(formatted).toContain('## TAKT ✅ 完了');
    expect(formatted).not.toContain('エラー出力');
  });

  it('handles empty stdout', () => {
    const result: TaktRunResult = {
      exitCode: 0,
      stdout: '',
      stderr: '',
    };

    const formatted = formatRunResult(result, 'review');

    expect(formatted).toContain('## TAKT ✅ 完了');
    expect(formatted).not.toContain('<details>');
  });

  it('truncates very long stdout', () => {
    const longOutput = 'x'.repeat(70000);
    const result: TaktRunResult = {
      exitCode: 0,
      stdout: longOutput,
      stderr: '',
    };

    const formatted = formatRunResult(result, 'review');

    expect(formatted).toContain('truncated');
    // Output should be truncated to MAX_COMMENT_LENGTH (60000)
    expect(formatted.length).toBeLessThan(longOutput.length);
  });
});
