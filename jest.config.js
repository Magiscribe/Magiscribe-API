/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+.tsx?$': ['ts-jest', {}],
  },
  rootDir: '.',
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/src/$1',
  },
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',

    // We ignore the following files because they have conditional
    // logic that is only enabled in production and will not have
    // coverage in the test environment.
    '/src/config.ts',
    '/src/log.ts',
  ],
};
