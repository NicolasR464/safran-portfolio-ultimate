import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import preferArrowFunctions from 'eslint-plugin-prefer-arrow-functions'

export default defineConfig([
    ...nextVitals,
    ...nextTs,
    {
        plugins: {
            'prefer-arrow-functions': preferArrowFunctions,
        },
        rules: {
            'import/no-relative-parent-imports': 'off',
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        '../*',
                        '../../*',
                        '../../../*',
                        '../../../../*',
                    ],
                },
            ],
            'prefer-arrow-functions/prefer-arrow-functions': ['error'],
            'no-console': 'error',
        },
    },
    globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
])
