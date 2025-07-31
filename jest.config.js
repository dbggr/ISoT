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
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  // Force tests to run serially to avoid database conflicts
  maxWorkers: 1,
  // Increase timeout for database operations
  testTimeout: 10000,
  // Module name mapping for Next.js paths
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  // Different test environments for different test types
  projects: [
    {
      displayName: 'node',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/unit/**/*.test.ts', '<rootDir>/tests/integration/**/*.test.ts'],
      testPathIgnorePatterns: ['<rootDir>/tests/unit/components/'],
      transform: {
        '^.+\\.ts$': 'ts-jest',
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
      },
    },
    {
      displayName: 'jsdom',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/tests/unit/components/**/*.test.tsx'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup-jsdom.ts'],
      transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
      },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
      },
      globals: {
        'ts-jest': {
          tsconfig: {
            jsx: 'react-jsx',
          },
        },
      },
    },
  ],
};