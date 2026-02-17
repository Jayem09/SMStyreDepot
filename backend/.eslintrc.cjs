module.exports = {
    root: true,
    env: {
        node: true,
        es2022: true,
    },
    extends: [
        'eslint:recommended',
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    rules: {
        'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
        'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        'prefer-const': 'warn',
    },
};
