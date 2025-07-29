/**
 * Individual Group API endpoints
 * Handles GET /api/groups/[id], PUT /api/groups/[id], and DELETE /api/groups/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { DefaultGroupService } from '../../../../api/services/GroupService';
import { withErrorHandler } from '../../../../api/middleware/error-handler';
import { validateUpdateGroup } from '../../../../api/middleware/validation';
import { logger } from '../../../../api/utils/logger';

const groupService = new DefaultGroupService();

/**
 * GET /api/groups/[id] - Get specific group by ID
 */
export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  logger.apiRequest('GET', `/api/groups/${id}`);
  
  const group = await groupService.getGroup(id);
  
  logger.apiResponse('GET', `/api/groups/${id}`, 200);
  return NextResponse.json(group, { status: 200 });
}, 'GET /api/groups/[id]');

/**
 * PUT /api/groups/[id] - Update existing group
 */
export const PUT = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  logger.apiRequest('PUT', `/api/groups/${id}`);
  
  // Validate request body
  const validation = await validateUpdateGroup(request);
  if (!validation.isValid) {
    return validation.response;
  }
  
  const group = await groupService.updateGroup(id, validation.data);
  
  logger.apiResponse('PUT', `/api/groups/${id}`, 200);
  return NextResponse.json(group, { status: 200 });
}, 'PUT /api/groups/[id]');

/**
 * DELETE /api/groups/[id] - Delete group
 */
export const DELETE = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  logger.apiRequest('DELETE', `/api/groups/${id}`);
  
  await groupService.deleteGroup(id);
  
  logger.apiResponse('DELETE', `/api/groups/${id}`, 200);
  return NextResponse.json(
    { message: 'Group deleted successfully' },
    { status: 200 }
  );
}, 'DELETE /api/groups/[id]');