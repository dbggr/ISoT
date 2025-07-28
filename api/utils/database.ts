import { getDatabase } from '../database/connection';
import { DatabaseError, handleDatabaseError } from './errors';

export interface QueryResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export function executeQuery<T = any>(
  query: string,
  params: any[] = []
): QueryResult<T> {
  try {
    const db = getDatabase();
    const stmt = db.prepare(query);
    const result = stmt.all(...params) as T;
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    const dbError = handleDatabaseError(error instanceof Error ? error : new Error('Unknown database error'));
    return {
      success: false,
      error: dbError.message
    };
  }
}

export function executeQuerySingle<T = any>(
  query: string,
  params: any[] = []
): QueryResult<T> {
  try {
    const db = getDatabase();
    const stmt = db.prepare(query);
    const result = stmt.get(...params) as T;
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    const dbError = handleDatabaseError(error instanceof Error ? error : new Error('Unknown database error'));
    return {
      success: false,
      error: dbError.message
    };
  }
}

export function executeInsert(
  query: string,
  params: any[] = []
): QueryResult<{ lastInsertRowid: number; changes: number }> {
  try {
    const db = getDatabase();
    const stmt = db.prepare(query);
    const result = stmt.run(...params);
    
    return {
      success: true,
      data: {
        lastInsertRowid: Number(result.lastInsertRowid),
        changes: result.changes
      }
    };
  } catch (error) {
    const dbError = handleDatabaseError(error instanceof Error ? error : new Error('Unknown database error'));
    return {
      success: false,
      error: dbError.message
    };
  }
}

export function executeUpdate(
  query: string,
  params: any[] = []
): QueryResult<{ changes: number }> {
  try {
    const db = getDatabase();
    const stmt = db.prepare(query);
    const result = stmt.run(...params);
    
    return {
      success: true,
      data: {
        changes: result.changes
      }
    };
  } catch (error) {
    const dbError = handleDatabaseError(error instanceof Error ? error : new Error('Unknown database error'));
    return {
      success: false,
      error: dbError.message
    };
  }
}

export function executeTransaction<T>(
  callback: () => T
): QueryResult<T> {
  try {
    const db = getDatabase();
    const transaction = db.transaction(callback);
    const result = transaction();
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    const dbError = handleDatabaseError(error instanceof Error ? error : new Error('Unknown database error'));
    return {
      success: false,
      error: dbError.message
    };
  }
}



export function parseJsonField<T>(value: string | null): T[] {
  if (!value) return [] as T[];
  
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [] as T[];
  }
}

export function stringifyJsonField<T>(value: T[]): string {
  return JSON.stringify(value || []);
}