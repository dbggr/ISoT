import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let db: Database.Database | null = null;

export interface DatabaseConfig {
  filename: string;
  readonly?: boolean;
  fileMustExist?: boolean;
  timeout?: number;
  verbose?: (message?: any, ...additionalArgs: any[]) => void;
}

/**
 * Get database file path based on environment configuration
 */
function getDatabasePath(): string {
  // Check for explicit DATABASE_PATH environment variable
  if (process.env.DATABASE_PATH) {
    return process.env.DATABASE_PATH;
  }

  // Environment-based defaults
  const environment = process.env.NODE_ENV || 'development';
  const baseDir = process.cwd();
  
  switch (environment) {
    case 'test':
      return path.join(baseDir, 'data', 'network-source-truth-test.db');
    case 'production':
      return path.join(baseDir, 'data', 'network-source-truth.db');
    case 'development':
    default:
      return path.join(baseDir, 'data', 'network-source-truth.db');
  }
}

export function getDatabase(config?: Partial<DatabaseConfig>): Database.Database {
  if (db) {
    return db;
  }

  // Get database path from environment with fallback
  const databasePath = getDatabasePath();
  
  const defaultConfig: DatabaseConfig = {
    filename: databasePath,
    readonly: false,
    fileMustExist: false,
    timeout: 5000,
  };

  const finalConfig = { ...defaultConfig, ...config };

  // Ensure the data directory exists
  const dbDir = path.dirname(finalConfig.filename);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  try {
    db = new Database(finalConfig.filename, {
      readonly: finalConfig.readonly,
      fileMustExist: finalConfig.fileMustExist,
      timeout: finalConfig.timeout,
      verbose: finalConfig.verbose,
    });

    // Enable foreign key constraints
    db.pragma('foreign_keys = ON');
    
    // Set journal mode to WAL for better concurrency
    db.pragma('journal_mode = WAL');
    
    // Set synchronous mode to NORMAL for better performance
    db.pragma('synchronous = NORMAL');

    return db;
  } catch (error) {
    throw new Error(`Failed to initialize database: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function closeDatabase(): void {
  if (db) {
    try {
      db.close();
      db = null;
    } catch (error) {
      console.error('Error closing database:', error);
    }
  }
}

export function isDatabaseOpen(): boolean {
  return db !== null && db.open;
}

// Graceful shutdown handler
process.on('SIGINT', () => {
  closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', () => {
  closeDatabase();
  process.exit(0);
});