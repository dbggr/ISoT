/**
 * Test script to verify automatic database initialization on startup
 */

import { databaseManager } from '../api/database';
import { ensureDatabaseInitialized } from '../api/database/init';

async function testStartupInitialization() {
  try {
    console.log('Testing automatic database initialization...');
    
    // Reset database first to simulate fresh start
    await databaseManager.resetDatabase();
    
    // Test that ensureDatabaseInitialized works correctly
    console.log('Testing ensureDatabaseInitialized...');
    await ensureDatabaseInitialized();
    
    // Verify default groups exist
    const db = (databaseManager as any).db;
    const groups = db.prepare('SELECT * FROM groups').all();
    
    console.log(`✓ Found ${groups.length} default groups:`);
    groups.forEach((group: any) => {
      console.log(`  - ${group.name}: ${group.description}`);
    });
    
    // Test that calling it again doesn't reinitialize
    console.log('Testing idempotent initialization...');
    await ensureDatabaseInitialized();
    
    const groupsAfter = db.prepare('SELECT * FROM groups').all();
    if (groups.length === groupsAfter.length) {
      console.log('✓ Idempotent initialization working correctly');
    } else {
      throw new Error('Initialization is not idempotent');
    }
    
    console.log('✓ Automatic database initialization test completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('✗ Automatic database initialization test failed:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

testStartupInitialization();