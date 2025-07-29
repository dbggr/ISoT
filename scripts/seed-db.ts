import { databaseManager } from '../api/database';

async function seedDatabase() {
  try {
    console.log('Seeding database with default data...');
    
    // Initialize database first if needed (this will also seed default data)
    await databaseManager.initializeDatabase();
    
    console.log('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Database seeding failed:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

seedDatabase();