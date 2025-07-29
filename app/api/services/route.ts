/**
 * Services API endpoints
 * Handles GET /api/services and POST /api/services
 */

import { NextRequest, NextResponse } from 'next/server';
import { DefaultNetworkServiceService } from '../../../api/services/NetworkServiceService';
import { withErrorHandler } from '../../../api/middleware/error-handler';
import { validateCreateNetworkService, validateServiceFilters } from '../../../api/middleware/validation';
import { logger } from '../../../api/utils/logger';

const networkServiceService = new DefaultNetworkServiceService();

/**
 * GET /api/services - List all services with optional filtering
 * Query parameters:
 * - groupId: Filter by group ID
 * - vlan: Filter by VLAN
 * - tags: Filter by tags (comma-separated)
 * - ipAddress: Filter by IP address
 * - cidrRange: Filter by CIDR range
 * - domain: Filter by domain
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
  logger.apiRequest('GET', '/api/services');
  
  // Validate query parameters
  const validation = validateServiceFilters(request);
  if (!validation.isValid) {
    return validation.response;
  }
  
  const services = await networkServiceService.getAllServices(validation.data);
  
  logger.apiResponse('GET', '/api/services', 200, { 
    count: services.length,
    filters: validation.data 
  });
  return NextResponse.json(services, { status: 200 });
}, 'GET /api/services');

/**
 * POST /api/services - Create new service
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  logger.apiRequest('POST', '/api/services');
  
  // Validate request body
  const validation = await validateCreateNetworkService(request);
  if (!validation.isValid) {
    return validation.response;
  }
  
  const service = await networkServiceService.createService(validation.data);
  
  logger.apiResponse('POST', '/api/services', 201, { serviceId: service.id });
  return NextResponse.json(service, { status: 201 });
}, 'POST /api/services');