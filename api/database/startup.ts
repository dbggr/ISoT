import { databaseManager } from './index';

/**
 * Initialize database on application startup
 * This function should be called when the application starts
 */
export async function initializeOnStartup(): Promise<void> {
  try {
    console.log('Starting database initialization on application startup...');
    
    // Ensure database is initialized with schema and default data
    await databaseManager.initializeDatabase();
    
    console.log('Database startup initialization completed');
  } catch (error) {
    console.error('Failed to initialize database on startup:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}