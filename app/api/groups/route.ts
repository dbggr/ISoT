/**
 * Groups API endpoints
 * Handles GET /api/groups and POST /api/groups
 */

import { NextRequest, NextResponse } from 'next/server';
import { DefaultGroupService } from '../../../api/services/GroupService';
import { withErrorHandler } from '../../../api/middleware/error-handler';
import { validateCreateGroup } from '../../../api/middleware/validation';
import { logger } from '../../../api/utils/logger';

const groupService = new DefaultGroupService();

/**
 * GET /api/groups - List all groups
 */
export const GET = withErrorHandler(async () => {
  logger.apiRequest('GET', '/api/groups');
  
  const groups = await groupService.getAllGroups();
  
  logger.apiResponse('GET', '/api/groups', 200, { count: groups.length });
  return NextResponse.json(groups, { status: 200 });
}, 'GET /api/groups');

/**
 * POST /api/groups - Create new group
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  logger.apiRequest('POST', '/api/groups');
  
  // Validate request body
  const validation = await validateCreateGroup(request);
  if (!validation.isValid) {
    return validation.response;
  }
  
  const group = await groupService.createGroup(validation.data);
  
  logger.apiResponse('POST', '/api/groups', 201, { groupId: group.id });
  return NextResponse.json(group, { status: 201 });
}, 'POST /api/groups');