/**
 * Individual Service API endpoints
 * Handles GET /api/services/[id], PUT /api/services/[id], and DELETE /api/services/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { DefaultNetworkServiceService } from '../../../../api/services/NetworkServiceService';
import { withErrorHandler } from '../../../../api/middleware/error-handler';
import { validateUpdateNetworkService } from '../../../../api/middleware/validation';
import { applyCorsHeaders } from '../../../../api/middleware/cors';
import { logger } from '../../../../api/utils/logger';

const networkServiceService = new DefaultNetworkServiceService();

/**
 * GET /api/services/[id] - Get specific service by ID
 */
export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  logger.apiRequest('GET', `/api/services/${id}`);
  
  const service = await networkServiceService.getService(id);
  
  logger.apiResponse('GET', `/api/services/${id}`, 200);
  const response = NextResponse.json(service, { status: 200 });
  return applyCorsHeaders(response, request);
}, 'GET /api/services/[id]');

/**
 * PUT /api/services/[id] - Update existing service
 */
export const PUT = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  logger.apiRequest('PUT', `/api/services/${id}`);
  
  // Validate request body
  const validation = await validateUpdateNetworkService(request);
  if (!validation.isValid) {
    return applyCorsHeaders(validation.response, request);
  }
  
  const service = await networkServiceService.updateService(id, validation.data);
  
  logger.apiResponse('PUT', `/api/services/${id}`, 200);
  const response = NextResponse.json(service, { status: 200 });
  return applyCorsHeaders(response, request);
}, 'PUT /api/services/[id]');

/**
 * DELETE /api/services/[id] - Delete service
 */
export const DELETE = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  logger.apiRequest('DELETE', `/api/services/${id}`);
  
  await networkServiceService.deleteService(id);
  
  logger.apiResponse('DELETE', `/api/services/${id}`, 200);
  const response = NextResponse.json(
    { message: 'Service deleted successfully' },
    { status: 200 }
  );
  return applyCorsHeaders(response, request);
}, 'DELETE /api/services/[id]');

/**
 * Handle preflight OPTIONS request
 */
export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  return applyCorsHeaders(response, request);
}