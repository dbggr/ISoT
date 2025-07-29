/**
 * Request validation middleware
 * Handles input validation using Zod schemas
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema, ZodError } from 'zod';
import { 
  CreateGroupSchema, 
  UpdateGroupSchema, 
  CreateNetworkServiceSchema, 
  UpdateNetworkServiceSchema,
  ServiceFiltersSchema
} from '../utils/schemas';
import { handleApiError } from './error-handler';
import { logger } from '../utils/logger';

/**
 * Generic validation function for request bodies
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<{ isValid: true; data: T } | { isValid: false; response: NextResponse }> {
  try {
    const body = await request.json();
    const validatedData = schema.parse(body);
    
    logger.debug('Request validation successful', { 
      schema: schema.constructor.name,
      data: validatedData 
    });
    
    return { isValid: true, data: validatedData };
  } catch (error) {
    logger.warn('Request validation failed', { 
      schema: schema.constructor.name,
      error 
    });
    
    if (error instanceof ZodError) {
      return { isValid: false, response: handleApiError(error, 'Request validation') };
    }
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return { 
        isValid: false, 
        response: handleApiError(
          new Error('Invalid JSON in request body'), 
          'Request validation'
        ) 
      };
    }
    
    return { isValid: false, response: handleApiError(error, 'Request validation') };
  }
}

/**
 * Validates query parameters against a schema
 */
export function validateQueryParams<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): { isValid: true; data: T } | { isValid: false; response: NextResponse } {
  try {
    const { searchParams } = new URL(request.url);
    const queryObject: Record<string, any> = {};
    
    // Convert URLSearchParams to object
    for (const [key, value] of searchParams.entries()) {
      // Handle comma-separated values (like tags)
      if (key === 'tags' && value.includes(',')) {
        queryObject[key] = value.split(',').map(tag => tag.trim());
      } else {
        queryObject[key] = value;
      }
    }
    
    const validatedData = schema.parse(queryObject);
    
    logger.debug('Query parameter validation successful', { 
      schema: schema.constructor.name,
      data: validatedData 
    });
    
    return { isValid: true, data: validatedData };
  } catch (error) {
    logger.warn('Query parameter validation failed', { 
      schema: schema.constructor.name,
      error 
    });
    
    return { isValid: false, response: handleApiError(error, 'Query parameter validation') };
  }
}

/**
 * Validation middleware for Group creation
 */
export const validateCreateGroup = async (request: NextRequest) => {
  return validateRequestBody(request, CreateGroupSchema);
};

/**
 * Validation middleware for Group updates
 */
export const validateUpdateGroup = async (request: NextRequest) => {
  return validateRequestBody(request, UpdateGroupSchema);
};

/**
 * Validation middleware for NetworkService creation
 */
export const validateCreateNetworkService = async (request: NextRequest) => {
  return validateRequestBody(request, CreateNetworkServiceSchema);
};

/**
 * Validation middleware for NetworkService updates
 */
export const validateUpdateNetworkService = async (request: NextRequest) => {
  return validateRequestBody(request, UpdateNetworkServiceSchema);
};

/**
 * Validation middleware for service filtering query parameters
 */
export const validateServiceFilters = (request: NextRequest) => {
  return validateQueryParams(request, ServiceFiltersSchema);
};

/**
 * Higher-order function that creates validation middleware for any schema
 */
export function createValidationMiddleware<T>(schema: ZodSchema<T>) {
  return async (request: NextRequest) => {
    return validateRequestBody(request, schema);
  };
}

/**
 * Validation middleware collection for easy access
 */
export const validationMiddleware = {
  validateCreateGroup,
  validateUpdateGroup,
  validateCreateNetworkService,
  validateUpdateNetworkService,
  validateServiceFilters,
  validateRequestBody,
  validateQueryParams,
  createValidationMiddleware
};

/**
 * Decorator for automatic request validation
 */
export function validateRequest<T>(schema: ZodSchema<T>) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<(request: NextRequest, ...args: any[]) => Promise<NextResponse>>
  ) {
    const originalMethod = descriptor.value;
    if (!originalMethod) return;

    descriptor.value = async function (request: NextRequest, ...args: any[]): Promise<NextResponse> {
      const validation = await validateRequestBody(request, schema);
      
      if (!validation.isValid) {
        return validation.response;
      }
      
      // Add validated data to request for use in handler
      (request as any).validatedData = validation.data;
      
      return originalMethod.apply(this, [request, ...args]);
    };
  };
}