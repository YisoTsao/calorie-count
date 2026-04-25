import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Agent skill scripts use CommonJS require()
    '.agents/**',
    // Prisma test scripts use CommonJS
    'prisma/test-connection.js',
    'prisma/test-connection.ts',
  ]),
  {
    rules: {
      // React Compiler's experimental lint rule is too strict for async data-fetching
      // patterns (async functions calling setState inside useEffect).
      'react-compiler/react-compiler': 'off',

      // react-hooks v6+ new rules: too strict for common data-fetching patterns
      // where setState is called from async functions invoked inside useEffect.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/variable-before-declaration': 'off',
      // purity rule flags Date.now() in render bodies and closures capturing
      // const-functions-declared-after-useEffect — both common React patterns.
      'react-hooks/purity': 'off',
      // immutability flags accessing const variables declared after useEffect
      // closures (temporal dead zone detection in react compiler).
      'react-hooks/immutability': 'off',

      // Allow underscore-prefixed parameters/variables to be safely unused
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
    },
  },
]);

export default eslintConfig;
