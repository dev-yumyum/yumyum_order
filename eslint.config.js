const js = require('@eslint/js');

module.exports = [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'commonjs',
            globals: {
                console: 'readonly',
                process: 'readonly',
                Buffer: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                exports: 'writable',
                module: 'writable',
                require: 'readonly',
                global: 'readonly'
            }
        },
        rules: {
            'no-unused-vars': ['error', { 
                'argsIgnorePattern': '^_',
                'varsIgnorePattern': '^_'
            }],
            'no-console': 'off',
            'prefer-const': 'error',
            'no-var': 'error',
            'semi': ['error', 'always'],
            'quotes': ['error', 'single'],
            'indent': ['error', 2],
            'no-trailing-spaces': 'error',
            'eol-last': 'error'
        }
    },
    {
        files: ['test/**/*.js', '**/*.test.js', '**/*.spec.js'],
        languageOptions: {
            globals: {
                describe: 'readonly',
                test: 'readonly',
                it: 'readonly',
                expect: 'readonly',
                beforeAll: 'readonly',
                afterAll: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                jest: 'readonly'
            }
        }
    }
];
