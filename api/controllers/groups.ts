/**
 * Groups API controller
 * Handles HTTP requests for group management endpoints
 * 
 * Note: This controller is now implemented using Next.js App Router API routes
 * in app/api/groups/route.ts and app/api/groups/[id]/route.ts
 */

import { DefaultGroupService } from '../services/GroupService';
import { ValidationError, NotFoundError, ConflictError } from '../utils/errors';

const groupService = new DefaultGroupService();

export const groupsController = {
  // GET /api/groups
  getAllGroups: async () => {
    return await groupService.getAllGroups();
  },

  // GET /api/groups/[id]
  getGroupById: async (id: string) => {
    return await groupService.getGroup(id);
  },

  // POST /api/groups
  createGroup: async (data: any) => {
    return await groupService.createGroup(data);
  },

  // PUT /api/groups/[id]
  updateGroup: async (id: string, data: any) => {
    return await groupService.updateGroup(id, data);
  },

  // DELETE /api/groups/[id]
  deleteGroup: async (id: string) => {
    await groupService.deleteGroup(id);
  }
};