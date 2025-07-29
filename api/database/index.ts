import { getDatabase } from './connection';
import fs from 'fs';
import path from 'path';

export interface Migration {
  version: number;
  name: string;
  up: string;
  down?: string;
}

export class DatabaseManager {
  private db = getDatabase();
  private initialized = false;

  constructor() {
    this.initializeMigrationTable();
  }

  private initializeMigrationTable(): void {
    try {
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS migrations (
          version INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } catch (error) {
      throw new Error(`Failed to initialize migration table: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async initializeDatabase(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      console.log('Initializing database schema...');
      
      // Read and execute the main schema
      const schemaPath = path.join(process.cwd(), 'api', 'database', 'schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      this.db.exec(schema);
      
      // Run any pending migrations
      await this.runMigrations();
      
      // Seed default data if needed
      await this.seedDefaultData();
      
      this.initialized = true;
      console.log('Database initialized successfully');
    } catch (error) {
      throw new Error(`Failed to initialize database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initializeDatabase();
    }
  }

  public async runMigrations(): Promise<void> {
    try {
      const migrationsDir = path.join(process.cwd(), 'api', 'database', 'migrations');
      
      // Create migrations directory if it doesn't exist
      if (!fs.existsSync(migrationsDir)) {
        fs.mkdirSync(migrationsDir, { recursive: true });
        return;
      }

      const migrationFiles = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();

      for (const file of migrationFiles) {
        const version = this.extractVersionFromFilename(file);
        if (version && !this.isMigrationApplied(version)) {
          await this.applyMigration(version, file);
        }
      }
    } catch (error) {
      throw new Error(`Failed to run migrations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private extractVersionFromFilename(filename: string): number | null {
    const match = filename.match(/^(\d+)_/);
    return match ? parseInt(match[1], 10) : null;
  }

  private isMigrationApplied(version: number): boolean {
    try {
      const stmt = this.db.prepare('SELECT version FROM migrations WHERE version = ?');
      const result = stmt.get(version);
      return result !== undefined;
    } catch (error) {
      throw new Error(`Failed to check migration status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async applyMigration(version: number, filename: string): Promise<void> {
    try {
      const migrationPath = path.join(process.cwd(), 'api', 'database', 'migrations', filename);
      const migrationSql = fs.readFileSync(migrationPath, 'utf8');
      
      // Execute migration in a transaction
      const transaction = this.db.transaction(() => {
        this.db.exec(migrationSql);
        
        // Record the migration as applied
        const stmt = this.db.prepare('INSERT INTO migrations (version, name) VALUES (?, ?)');
        stmt.run(version, filename);
      });
      
      transaction();
      
      console.log(`Applied migration: ${filename}`);
    } catch (error) {
      throw new Error(`Failed to apply migration ${filename}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async seedDefaultData(): Promise<void> {
    try {
      // Check if groups already exist
      const stmt = this.db.prepare('SELECT COUNT(*) as count FROM groups');
      const result = stmt.get() as { count: number };
      
      if (result.count === 0) {
        // Insert default groups
        const insertGroup = this.db.prepare(`
          INSERT OR IGNORE INTO groups (id, name, description) 
          VALUES (?, ?, ?)
        `);
        
        const { generateUUID } = await import('../utils/uuid');
        
        const defaultGroups = [
          {
            id: generateUUID(),
            name: 'Storage',
            description: 'Storage and data persistence services'
          },
          {
            id: generateUUID(),
            name: 'Security',
            description: 'Security and authentication services'
          },
          {
            id: generateUUID(),
            name: 'Data Services',
            description: 'Data processing and analytics services'
          }
        ];
        
        const transaction = this.db.transaction(() => {
          for (const group of defaultGroups) {
            insertGroup.run(group.id, group.name, group.description);
          }
        });
        
        transaction();
        
        console.log('Default groups seeded successfully');
      }
    } catch (error) {
      throw new Error(`Failed to seed default data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public getAppliedMigrations(): Migration[] {
    try {
      const stmt = this.db.prepare('SELECT version, name, applied_at FROM migrations ORDER BY version');
      return stmt.all() as Migration[];
    } catch (error) {
      throw new Error(`Failed to get applied migrations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async resetDatabase(): Promise<void> {
    try {
      // Drop all tables
      this.db.exec(`
        DROP TABLE IF EXISTS network_services;
        DROP TABLE IF EXISTS groups;
        DROP TABLE IF EXISTS migrations;
      `);
      
      // Reset initialization state
      this.initialized = false;
      
      // Reinitialize the migration table first
      this.initializeMigrationTable();
      
      // Then initialize the database (this will also seed default data)
      await this.initializeDatabase();
      
      console.log('Database reset successfully');
    } catch (error) {
      throw new Error(`Failed to reset database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const databaseManager = new DatabaseManager();

// Export database connection for direct use
export { getDatabase, closeDatabase, isDatabaseOpen } from './connection';