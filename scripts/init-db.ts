import { databaseManager } from '../api/database';

async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    await databaseManager.initializeDatabase();
    console.log('Database initialization completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

initializeDatabase();