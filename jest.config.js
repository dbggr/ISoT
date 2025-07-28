module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests', '<rootDir>/api'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'api/**/*.ts',
    '!api/**/*.d.ts',
  ],
  moduleFileExtensions: ['ts', 'js', 'json'],
  setupFilesAfterEnv: [],
};