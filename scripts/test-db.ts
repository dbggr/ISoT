import { getDatabase, databaseManager } from '../api/database';

async function testDatabase() {
  try {
    console.log('Testing database connection and setup...');
    
    const db = getDatabase();
    
    // Test basic connection
    console.log('✓ Database connection established');
    
    // Test groups table
    const groups = db.prepare('SELECT * FROM groups').all();
    console.log(`✓ Found ${groups.length} groups:`, groups.map((g: any) => g.name));
    
    // Test migrations table
    const migrations = databaseManager.getAppliedMigrations();
    console.log(`✓ Applied migrations: ${migrations.length}`);
    migrations.forEach(m => console.log(`  - ${m.name}`));
    
    // Test network_services table structure
    const tableInfo = db.prepare("PRAGMA table_info(network_services)").all();
    console.log(`✓ Network services table has ${tableInfo.length} columns`);
    
    // Test indexes
    const indexes = db.prepare("PRAGMA index_list(network_services)").all();
    console.log(`✓ Network services table has ${indexes.length} indexes`);
    
    console.log('✓ Database test completed successfully');
    
  } catch (error) {
    console.error('Database test failed:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

testDatabase();