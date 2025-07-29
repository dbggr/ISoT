/**
 * CORS configuration middleware
 * Handles Cross-Origin Resource Sharing settings
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * CORS configuration options
 */
export interface CorsOptions {
  origin?: string | string[] | boolean;
  methods?: string[];
  allowedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

/**
 * Default CORS configuration
 */
const defaultCorsOptions: CorsOptions = {
  origin: process.env.NODE_ENV === 'development' ? true : false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
  maxAge: 86400 // 24 hours
};

/**
 * Applies CORS headers to a response
 */
export function applyCorsHeaders(
  response: NextResponse,
  request: NextRequest,
  options: CorsOptions = defaultCorsOptions
): NextResponse {
  const origin = request.headers.get('origin');
  
  // Handle origin
  if (options.origin === true) {
    response.headers.set('Access-Control-Allow-Origin', origin || '*');
  } else if (typeof options.origin === 'string') {
    response.headers.set('Access-Control-Allow-Origin', options.origin);
  } else if (Array.isArray(options.origin) && origin) {
    if (options.origin.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }
  }
  
  // Handle methods
  if (options.methods) {
    response.headers.set('Access-Control-Allow-Methods', options.methods.join(', '));
  }
  
  // Handle headers
  if (options.allowedHeaders) {
    response.headers.set('Access-Control-Allow-Headers', options.allowedHeaders.join(', '));
  }
  
  // Handle credentials
  if (options.credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
  
  // Handle max age
  if (options.maxAge) {
    response.headers.set('Access-Control-Max-Age', options.maxAge.toString());
  }
  
  return response;
}

/**
 * Creates a CORS middleware function
 */
export function createCorsMiddleware(options: CorsOptions = defaultCorsOptions) {
  return (request: NextRequest, response: NextResponse) => {
    return applyCorsHeaders(response, request, options);
  };
}

/**
 * Handles preflight OPTIONS requests
 */
export function handlePreflightRequest(
  request: NextRequest,
  options: CorsOptions = defaultCorsOptions
): NextResponse {
  const response = new NextResponse(null, { status: 200 });
  return applyCorsHeaders(response, request, options);
}

/**
 * Default CORS middleware
 */
export const corsMiddleware = createCorsMiddleware();