module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'airbnb-typescript/base',
    'prettier',
    'plugin:prettier/recommended',
  ],
  rules: {
    // Prettier integration
    'prettier/prettier': 'error',

    // TypeScript rules
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'warn',

    // Import rules
    'import/prefer-default-export': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/extensions': 'off',

    // Style rules
    'max-len': ['warn', { code: 100 }],

    // Temporary disabled rules until existing code is fixed
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-misused-promises': 'off',
  },
  ignorePatterns: [
    'dist/',
    'node_modules/',
    'jest.config.js',
    '.eslintrc.js',
    'coverage/',
    'testConfig/',
  ],
  overrides: [
    {
      files: ['tests/**/*.ts', 'testConfig/**/*.ts'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/unbound-method': 'off',
        '@typescript-eslint/no-shadow': 'off',
        '@typescript-eslint/no-misused-promises': 'off',
      },
    },
    {
      // Express-specific rules
      files: ['src/app.ts', 'src/routes/**/*.ts', 'src/middleware/**/*.ts'],
      rules: {
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/ban-types': 'off',
        '@typescript-eslint/restrict-plus-operands': 'off',
        '@typescript-eslint/no-misused-promises': 'off',
        '@typescript-eslint/unbound-method': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
      },
    },
    {
      // Server file rules
      files: ['src/server.ts'],
      rules: {
        '@typescript-eslint/no-unsafe-argument': 'off',
      },
    },
    {
      // Test files rules
      files: ['tests/**/*.ts'],
      rules: {
        '@typescript-eslint/no-unsafe-argument': 'off',
      },
    },
  ],
};
