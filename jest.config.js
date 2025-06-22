module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/backend'],
  testMatch: ['**/test/**/*.test.ts', '**/test/**/*.spec.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', 'setup.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'backend/**/*.ts',
    '!backend/**/*.d.ts',
    '!backend/test/**/*.ts',
  ],
  setupFilesAfterEnv: ['<rootDir>/backend/test/setup.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  testTimeout: 10000,
}; 