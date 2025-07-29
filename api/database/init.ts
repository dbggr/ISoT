import { databaseManager } from './index';

let initializationPromise: Promise<void> | null = null;

/**
 * Ensures database is initialized exactly once
 * Returns a promise that resolves when initialization is complete
 */
export function ensureDatabaseInitialized(): Promise<void> {
  if (!initializationPromise) {
    initializationPromise = databaseManager.initializeDatabase();
  }
  return initializationPromise;
}

/**
 * Reset the initialization state (useful for testing)
 */
export function resetInitializationState(): void {
  initializationPromise = null;
}