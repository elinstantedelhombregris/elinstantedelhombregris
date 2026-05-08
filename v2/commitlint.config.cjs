/**
 * Conventional Commits enforced via commitlint.
 *
 * Allowed types:
 *   feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
 *
 * Allowed scopes are workspace-aware and reflect the v2 layout.
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert'],
    ],
    'scope-enum': [
      1,
      'always',
      [
        'v2',
        'web',
        'api',
        'db',
        'shared',
        'ui',
        'config',
        'content',
        'docs',
        'scripts',
        'tests',
        'auth',
        'deps',
      ],
    ],
    'subject-case': [2, 'never', ['upper-case']],
    'header-max-length': [2, 'always', 100],
  },
};
