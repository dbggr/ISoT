/**
 * Error handling utilities
 * Custom error classes and error response formatting
 */

// Placeholder - will be implemented in task 10
export interface ApiError {
  error: string;
  message: string;
  details?: any;
  timestamp: string;
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}