import { describe, expect, it } from 'vitest';
import { checkDotVsCodeExists, checkPkgExists } from '../src/utils';

describe('should', () => {
  it('should check pkg exists', () => {
    console.warn('hello world');
    expect(checkPkgExists(process.cwd())).toBe(true);
  });

  it('should check .vscode exists', () => {
    expect(checkDotVsCodeExists(process.cwd())).toBe(true);
  });
});
