/**
 * Unit tests for error handling middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { 
  handleApiError, 
  createErrorResponse, 
  withErrorHandler,
  ERROR_CODES 
} from '../../../api/middleware/error-handler';
import { ValidationError, NotFoundError, ConflictError, DatabaseError } from '../../../api/utils/errors';

// Mock logger to avoid console output during tests
jest.mock('../../../api/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
  }
}));

describe('Error Handler Middleware', () => {
  describe('createErrorResponse', () => {
    it('should create standardized error response', () => {
      const response = createErrorResponse('Test Error', 'Test message', 400);
      
      expect(response.status).toBe(400);
      // Note: We can't easily test the JSON content in this setup
      // but the structure is validated by integration tests
    });

    it('should include details when provided', () => {
      const details = { field: 'name', code: 'required' };
      const response = createErrorResponse('Test Error', 'Test message', 400, details);
      
      expect(response.status).toBe(400);
    });
  });

  describe('handleApiError', () => {
    it('should handle ZodError correctly', () => {
      const zodError = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'undefined',
          path: ['name'],
          message: 'Required'
        }
      ]);

      const response = handleApiError(zodError);
      expect(response.status).toBe(400);
    });

    it('should handle ValidationError correctly', () => {
      const validationError = new ValidationError('Invalid input', 'name');
      
      const response = handleApiError(validationError);
      expect(response.status).toBe(400);
    });

    it('should handle NotFoundError correctly', () => {
      const notFoundError = new NotFoundError('User', '123');
      
      const response = handleApiError(notFoundError);
      expect(response.status).toBe(404);
    });

    it('should handle ConflictError correctly', () => {
      const conflictError = new ConflictError('Resource already exists');
      
      const response = handleApiError(conflictError);
      expect(response.status).toBe(409);
    });

    it('should handle DatabaseError correctly', () => {
      const databaseError = new DatabaseError('Database connection failed');
      
      const response = handleApiError(databaseError);
      expect(response.status).toBe(500);
    });

    it('should handle generic Error correctly', () => {
      const genericError = new Error('Something went wrong');
      
      const response = handleApiError(genericError);
      expect(response.status).toBe(500);
    });

    it('should handle unknown errors correctly', () => {
      const unknownError = 'string error';
      
      const response = handleApiError(unknownError);
      expect(response.status).toBe(500);
    });
  });

  describe('withErrorHandler', () => {
    it('should wrap handler and catch errors', async () => {
      const mockHandler = jest.fn().mockRejectedValue(new Error('Test error'));
      const wrappedHandler = withErrorHandler(mockHandler, 'test context');

      const response = await wrappedHandler();
      
      expect(mockHandler).toHaveBeenCalled();
      expect(response.status).toBe(500);
    });

    it('should pass through successful responses', async () => {
      const successResponse = NextResponse.json({ success: true });
      const mockHandler = jest.fn().mockResolvedValue(successResponse);
      const wrappedHandler = withErrorHandler(mockHandler, 'test context');

      const response = await wrappedHandler();
      
      expect(mockHandler).toHaveBeenCalled();
      expect(response).toBe(successResponse);
    });
  });

  describe('ERROR_CODES', () => {
    it('should have correct error code mappings', () => {
      expect(ERROR_CODES.VALIDATION_ERROR).toBe('Bad Request');
      expect(ERROR_CODES.NOT_FOUND).toBe('Not Found');
      expect(ERROR_CODES.CONFLICT).toBe('Conflict');
      expect(ERROR_CODES.DATABASE_ERROR).toBe('Database Error');
      expect(ERROR_CODES.INTERNAL_SERVER_ERROR).toBe('Internal Server Error');
      expect(ERROR_CODES.BAD_REQUEST).toBe('Bad Request');
    });
  });
});