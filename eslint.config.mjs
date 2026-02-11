// @ts-check
import antfu from '@antfu/eslint-config';

export default antfu(
  {
    ignores: [
      // eslint ignore globs here
    ],
  },
  {
    rules: {
      // overrides
      '@stylistic/semi': [1, 'always'],
      '@stylistic/brace-style': [1, '1tbs'],
    },
  },
);
