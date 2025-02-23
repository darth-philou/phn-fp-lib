import globals from 'globals';
import pluginJs from '@eslint/js';

/** @type {import('eslint').Linter.Config[]} */
export default [
    { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },
    { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
    pluginJs.configs.recommended,
    {
        plugins: ['jest', 'prettier'],
        rules: {
            curly: 'error',
            eqeqeq: 'error',
            'linebreak-style': ['error', 'unix'],
            'no-var': 'error',
            'object-shorthand': 'error',
            'prefer-arrow-callback': 'error',
            'prefer-const': 'error',
            'prefer-template': 'warn',
            'rest-spread-spacing': 'warn'
        }
    }
];
