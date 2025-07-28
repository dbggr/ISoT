export class DatabaseError extends Error {
  constructor(message: string, public readonly originalError?: Error) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public readonly field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with id '${id}' not found`);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export function isUniqueConstraintError(error: Error): boolean {
  return error.message.includes('UNIQUE constraint failed');
}

export function isForeignKeyConstraintError(error: Error): boolean {
  return error.message.includes('FOREIGN KEY constraint failed');
}

export function handleDatabaseError(error: Error): DatabaseError {
  if (isUniqueConstraintError(error)) {
    return new ConflictError('Resource already exists');
  }
  
  if (isForeignKeyConstraintError(error)) {
    return new ValidationError('Referenced resource does not exist');
  }
  
  return new DatabaseError('Database operation failed', error);
}