import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import astroPlugin from 'eslint-plugin-astro';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export default [
    // Ignore patterns
    {
        ignores: [
            'node_modules/**',
            'dist/**',
            '.astro/**',
            '.vercel/**',
            '.vscode/**',
            'coverage/**',
            'playwright-report/**',
            'test-results/**',
            '*.config.js',
            '*.config.mjs',
            '*.config.ts'
        ]
    },

    // Base JavaScript/TypeScript config
    js.configs.recommended,
    {
        files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
        plugins: {
            '@typescript-eslint': tsPlugin,
            'react': reactPlugin,
            'react-hooks': reactHooksPlugin
        },
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                ecmaFeatures: {
                    jsx: true
                }
            },
            globals: {
                // Browser globals
                window: 'readonly',
                document: 'readonly',
                navigator: 'readonly',
                console: 'readonly',
                alert: 'readonly',
                setTimeout: 'readonly',
                setInterval: 'readonly',
                clearTimeout: 'readonly',
                clearInterval: 'readonly',
                fetch: 'readonly',
                HTMLInputElement: 'readonly',
                HTMLElement: 'readonly',
                // Node.js globals
                process: 'readonly',
                Buffer: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                module: 'readonly',
                require: 'readonly',
                exports: 'readonly',
                global: 'readonly'
            }
        },
        settings: {
            react: {
                version: 'detect'
            }
        },
        rules: {
            ...tsPlugin.configs.recommended.rules,
            ...reactPlugin.configs.recommended.rules,
            ...reactHooksPlugin.configs.recommended.rules,
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/no-explicit-any': 'warn'
        }
    },

    // Astro config
    ...astroPlugin.configs.recommended,
    {
        files: ['**/*.astro'],
        languageOptions: {
            parser: astroPlugin.parser,
            parserOptions: {
                parser: tsParser,
                extraFileExtensions: ['.astro']
            }
        }
    }
];
