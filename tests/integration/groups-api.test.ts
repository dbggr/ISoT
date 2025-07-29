/**
 * Integration tests for Groups API endpoints
 * Tests the API route handlers directly
 */

import { NextRequest } from 'next/server';
import { GET as getGroups, POST as createGroup } from '../../app/api/groups/route';
import { GET as getGroup, PUT as updateGroup, DELETE as deleteGroup } from '../../app/api/groups/[id]/route';

// Helper function to create mock NextRequest
const createMockRequest = (method: string, body?: any): NextRequest => {
  const url = 'http://localhost:3000/api/groups';
  const request = new Request(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  
  return request as NextRequest;
};

describe('Groups API Route Handlers', () => {
  describe('GET /api/groups', () => {
    it('should return array of groups', async () => {
      const response = await getGroups();
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });
  });
  
  describe('POST /api/groups', () => {
    it('should create a new group with valid data', async () => {
      const groupData = {
        name: `test-group-${Date.now()}`, // Unique name to avoid conflicts
        description: 'Test group description'
      };
      
      const request = createMockRequest('POST', groupData);
      const response = await createGroup(request);
      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data).toMatchObject({
        name: groupData.name,
        description: groupData.description
      });
      expect(data.id).toBeDefined();
      expect(data.createdAt).toBeDefined();
      expect(data.updatedAt).toBeDefined();
    });
    
    it('should return 400 for invalid data', async () => {
      const request = createMockRequest('POST', {});
      const response = await createGroup(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe('Bad Request');
      expect(data.message).toContain('Validation failed');
    });
  });
  
  describe('GET /api/groups/[id]', () => {
    it('should return 404 for non-existent group', async () => {
      const request = createMockRequest('GET');
      const params = { params: Promise.resolve({ id: 'non-existent-id' }) };
      const response = await getGroup(request, params);
      const data = await response.json();
      
      expect(response.status).toBe(404);
      expect(data.error).toBe('Not Found');
    });
    
    it('should return 400 for empty ID', async () => {
      const request = createMockRequest('GET');
      const params = { params: Promise.resolve({ id: '' }) };
      const response = await getGroup(request, params);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe('Bad Request');
    });
  });
  
  describe('PUT /api/groups/[id]', () => {
    it('should return 404 for non-existent group', async () => {
      const updateData = { name: 'new-name' };
      const request = createMockRequest('PUT', updateData);
      const params = { params: Promise.resolve({ id: 'non-existent-id' }) };
      const response = await updateGroup(request, params);
      const data = await response.json();
      
      expect(response.status).toBe(404);
      expect(data.error).toBe('Not Found');
    });
    
    it('should return 400 for invalid data', async () => {
      const updateData = { name: '' };
      const request = createMockRequest('PUT', updateData);
      const params = { params: Promise.resolve({ id: 'some-id' }) };
      const response = await updateGroup(request, params);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe('Bad Request');
    });
  });
  
  describe('DELETE /api/groups/[id]', () => {
    it('should return 404 for non-existent group', async () => {
      const request = createMockRequest('DELETE');
      const params = { params: Promise.resolve({ id: 'non-existent-id' }) };
      const response = await deleteGroup(request, params);
      const data = await response.json();
      
      expect(response.status).toBe(404);
      expect(data.error).toBe('Not Found');
    });
    
    it('should return 400 for empty ID', async () => {
      const request = createMockRequest('DELETE');
      const params = { params: Promise.resolve({ id: '' }) };
      const response = await deleteGroup(request, params);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe('Bad Request');
    });
  });
  
  describe('Error Response Format', () => {
    it('should return standardized error format', async () => {
      const request = createMockRequest('POST', {});
      const response = await createGroup(request);
      const data = await response.json();
      
      expect(data).toHaveProperty('error');
      expect(data).toHaveProperty('message');
      expect(data).toHaveProperty('timestamp');
      expect(typeof data.timestamp).toBe('string');
    });
  });
});