module.exports = {
  rootDir: '.',
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'ts', 'json'],
  testMatch: ['**/test/**/*.integration-spec.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverage: false,
};
