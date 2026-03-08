import { describe, expect, it } from 'vitest';
import { checkDotVsCodeExists, checkPkgExists, mergeConfig } from '../src/utils';

describe('should', () => {
  it('should check pkg exists', () => {
    console.warn('hello world');
    expect(checkPkgExists(process.cwd())).toBe(true);
  });

  it('should check .vscode exists', () => {
    expect(checkDotVsCodeExists(process.cwd())).toBe(true);
  });

  it('should merge config', () => {
    const oldConfig = { aaa: { description: 'aaa' }, bbb: { description: 'b' } };
    const newConfig = { bbb: { description: 'bbb' } };
    const mergedConfig = mergeConfig(oldConfig, newConfig);

    expect(mergedConfig).toEqual({ aaa: { description: '' }, bbb: { description: 'bbb' } });
  });
});
