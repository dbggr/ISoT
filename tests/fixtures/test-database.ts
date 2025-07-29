/**
 * Test database utilities for integration tests
 */

import { databaseManager } from '../../api/database';

export class TestDatabaseManager {
  /**
   * Set up test database before each test
   */
  static async setupTestDatabase(): Promise<void> {
    // Ensure we're using test environment
    (process.env as any).NODE_ENV = 'test';
    
    try {
      // Reset database to clean state
      await databaseManager.resetDatabase();
    } catch (error) {
      console.error('Failed to setup test database:', error);
      // Try to initialize if reset fails
      await databaseManager.initializeDatabase();
    }
  }

  /**
   * Clean up test database after each test
   */
  static async cleanupTestDatabase(): Promise<void> {
    try {
      // Reset database to ensure clean state for next test
      await databaseManager.resetDatabase();
    } catch (error) {
      console.error('Failed to cleanup test database:', error);
      // Continue with test execution even if cleanup fails
    }
  }

  /**
   * Get test database instance
   */
  static getTestDatabase() {
    return databaseManager;
  }

  /**
   * Verify test database is properly configured
   */
  static verifyTestEnvironment(): void {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('Tests must run in test environment. Set NODE_ENV=test');
    }
  }
}

/**
 * Jest setup helper for database tests
 */
export const setupDatabaseTests = () => {
  beforeAll(() => {
    TestDatabaseManager.verifyTestEnvironment();
  });

  beforeEach(async () => {
    await TestDatabaseManager.setupTestDatabase();
  });

  afterEach(async () => {
    await TestDatabaseManager.cleanupTestDatabase();
  });

  afterAll(async () => {
    // Final cleanup
    try {
      await TestDatabaseManager.cleanupTestDatabase();
    } catch (error) {
      console.error('Final cleanup failed:', error);
    }
  });
};