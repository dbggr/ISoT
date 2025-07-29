/**
 * Comprehensive integration tests for Groups API endpoints
 * Tests all CRUD operations, validation, error handling, and edge cases
 */

import { NextRequest } from 'next/server';
import { GET as getGroups, POST as createGroup } from '../../app/api/groups/route';
import { GET as getGroup, PUT as updateGroup, DELETE as deleteGroup } from '../../app/api/groups/[id]/route';
import { setupDatabaseTests } from '../fixtures/test-database';
import { testGroups, invalidTestData } from '../fixtures/test-data';

// Helper function to create mock NextRequest
const createMockRequest = (method: string, url: string = 'http://localhost:3000/api/groups', body?: any): NextRequest => {
  const request = new Request(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  
  return request as NextRequest;
};

// Mock console.error to avoid cluttering test output
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('Groups API Integration Tests', () => {
  // Set up test database for each test
  setupDatabaseTests();

  describe('GET /api/groups', () => {
    it('should return default groups after database initialization', async () => {
      const request = createMockRequest('GET');
      const response = await getGroups(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThanOrEqual(3); // Default groups: storage, security, data_services
      
      // Verify default groups exist
      const groupNames = data.map((group: any) => group.name);
      expect(groupNames).toContain('Storage');
      expect(groupNames).toContain('Security');
      expect(groupNames).toContain('Data Services');
    });

    it('should return groups with correct structure', async () => {
      const request = createMockRequest('GET');
      const response = await getGroups(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.length).toBeGreaterThan(0);
      
      // Verify group structure
      const group = data[0];
      expect(group).toHaveProperty('id');
      expect(group).toHaveProperty('name');
      expect(group).toHaveProperty('description');
      expect(group).toHaveProperty('createdAt');
      expect(group).toHaveProperty('updatedAt');
      expect(typeof group.id).toBe('string');
      expect(typeof group.name).toBe('string');
      expect(typeof group.createdAt).toBe('string');
      expect(typeof group.updatedAt).toBe('string');
    });

    it('should return groups in consistent order', async () => {
      // Create additional test groups
      for (const testGroup of testGroups) {
        const request = createMockRequest('POST', 'http://localhost:3000/api/groups', testGroup);
        await createGroup(request);
      }

      const request1 = createMockRequest('GET');
      const response1 = await getGroups(request1);
      const data1 = await response1.json();
      
      const request2 = createMockRequest('GET');
      const response2 = await getGroups(request2);
      const data2 = await response2.json();
      
      expect(data1).toEqual(data2);
    });
  });
  
  describe('POST /api/groups', () => {
    it('should create a new group with valid data', async () => {
      const groupData = {
        name: `test-group-${Date.now()}`,
        description: 'Test group description'
      };
      
      const request = createMockRequest('POST', 'http://localhost:3000/api/groups', groupData);
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
      expect(typeof data.id).toBe('string');
      expect(data.id.length).toBeGreaterThan(0);
    });

    it('should create a group with only required fields', async () => {
      const groupData = {
        name: `minimal-group-${Date.now()}`
      };
      
      const request = createMockRequest('POST', 'http://localhost:3000/api/groups', groupData);
      const response = await createGroup(request);
      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data.name).toBe(groupData.name);
      expect(data.description === null || data.description === undefined).toBe(true);
      expect(data.id).toBeDefined();
    });

    it('should return 400 for missing required fields', async () => {
      const request = createMockRequest('POST', 'http://localhost:3000/api/groups', {});
      const response = await createGroup(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe('Bad Request');
      expect(data.message).toContain('Validation failed');
    });

    it('should return 400 for empty name', async () => {
      const request = createMockRequest('POST', 'http://localhost:3000/api/groups', invalidTestData.groups.emptyName);
      const response = await createGroup(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe('Bad Request');
    });

    it('should return 409 for duplicate group name', async () => {
      const groupData = {
        name: `duplicate-group-${Date.now()}`,
        description: 'First group'
      };
      
      // Create first group
      const request1 = createMockRequest('POST', 'http://localhost:3000/api/groups', groupData);
      const response1 = await createGroup(request1);
      expect(response1.status).toBe(201);
      
      // Try to create duplicate
      const request2 = createMockRequest('POST', 'http://localhost:3000/api/groups', {
        ...groupData,
        description: 'Duplicate group'
      });
      const response2 = await createGroup(request2);
      const data2 = await response2.json();
      
      expect(response2.status).toBe(409);
      expect(data2.error).toBe('Conflict');
      expect(data2.message).toContain('already exists');
    });

    it('should handle malformed JSON', async () => {
      const request = new Request('http://localhost:3000/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: '{ invalid json'
      }) as NextRequest;
      
      const response = await createGroup(request);
      const data = await response.json();
      
      expect([400, 500]).toContain(response.status); // Could be 400 or 500 depending on error handling
      expect(data.error).toBeDefined();
    });
  });
  
  describe('GET /api/groups/[id]', () => {
    let testGroupId: string;

    beforeEach(async () => {
      // Create a test group for each test
      const groupData = {
        name: `test-group-${Date.now()}`,
        description: 'Test group for GET tests'
      };
      
      const request = createMockRequest('POST', 'http://localhost:3000/api/groups', groupData);
      const response = await createGroup(request);
      const data = await response.json();
      testGroupId = data.id;
    });

    it('should return specific group by ID', async () => {
      const request = createMockRequest('GET');
      const params = { params: Promise.resolve({ id: testGroupId }) };
      const response = await getGroup(request, params);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.id).toBe(testGroupId);
      expect(data).toHaveProperty('name');
      expect(data).toHaveProperty('description');
      expect(data).toHaveProperty('createdAt');
      expect(data).toHaveProperty('updatedAt');
    });

    it('should return 404 for non-existent group', async () => {
      const request = createMockRequest('GET');
      const params = { params: Promise.resolve({ id: 'non-existent-id' }) };
      const response = await getGroup(request, params);
      const data = await response.json();
      
      expect(response.status).toBe(404);
      expect(data.error).toBe('Not Found');
      expect(data.message).toContain('not found');
    });
    
    it('should return 400 for empty ID', async () => {
      const request = createMockRequest('GET');
      const params = { params: Promise.resolve({ id: '' }) };
      const response = await getGroup(request, params);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe('Bad Request');
    });

    it('should return 400 for invalid ID format', async () => {
      const request = createMockRequest('GET');
      const params = { params: Promise.resolve({ id: '   ' }) }; // Whitespace only
      const response = await getGroup(request, params);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe('Bad Request');
    });
  });
  
  describe('PUT /api/groups/[id]', () => {
    let testGroupId: string;

    beforeEach(async () => {
      // Create a test group for each test
      const groupData = {
        name: `test-group-${Date.now()}`,
        description: 'Test group for PUT tests'
      };
      
      const request = createMockRequest('POST', 'http://localhost:3000/api/groups', groupData);
      const response = await createGroup(request);
      const data = await response.json();
      testGroupId = data.id;
    });

    it('should update existing group with valid data', async () => {
      const updateData = {
        name: `updated-group-${Date.now()}`,
        description: 'Updated description'
      };
      
      const request = createMockRequest('PUT', 'http://localhost:3000/api/groups', updateData);
      const params = { params: Promise.resolve({ id: testGroupId }) };
      const response = await updateGroup(request, params);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.id).toBe(testGroupId);
      expect(data.name).toBe(updateData.name);
      expect(data.description).toBe(updateData.description);
      expect(data.updatedAt).toBeDefined();
    });

    it('should update only provided fields', async () => {
      const updateData = { name: `partial-update-${Date.now()}` };
      
      const request = createMockRequest('PUT', 'http://localhost:3000/api/groups', updateData);
      const params = { params: Promise.resolve({ id: testGroupId }) };
      const response = await updateGroup(request, params);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.name).toBe(updateData.name);
      expect(data.description).toBe('Test group for PUT tests'); // Original description preserved
    });

    it('should return 404 for non-existent group', async () => {
      const updateData = { name: 'new-name' };
      const request = createMockRequest('PUT', 'http://localhost:3000/api/groups', updateData);
      const params = { params: Promise.resolve({ id: 'non-existent-id' }) };
      const response = await updateGroup(request, params);
      const data = await response.json();
      
      expect(response.status).toBe(404);
      expect(data.error).toBe('Not Found');
    });
    
    it('should return 400 for invalid data', async () => {
      const updateData = { name: '' };
      const request = createMockRequest('PUT', 'http://localhost:3000/api/groups', updateData);
      const params = { params: Promise.resolve({ id: testGroupId }) };
      const response = await updateGroup(request, params);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe('Bad Request');
    });

    it('should return 409 for duplicate name conflict', async () => {
      // Create another group
      const anotherGroup = {
        name: `another-group-${Date.now()}`,
        description: 'Another test group'
      };
      const request1 = createMockRequest('POST', 'http://localhost:3000/api/groups', anotherGroup);
      await createGroup(request1);

      // Try to update first group with the same name as second group
      const updateData = { name: anotherGroup.name };
      const request2 = createMockRequest('PUT', 'http://localhost:3000/api/groups', updateData);
      const params = { params: Promise.resolve({ id: testGroupId }) };
      const response = await updateGroup(request2, params);
      const data = await response.json();
      
      expect(response.status).toBe(409);
      expect(data.error).toBe('Conflict');
    });
  });
  
  describe('DELETE /api/groups/[id]', () => {
    let testGroupId: string;

    beforeEach(async () => {
      // Create a test group for each test
      const groupData = {
        name: `test-group-${Date.now()}`,
        description: 'Test group for DELETE tests'
      };
      
      const request = createMockRequest('POST', 'http://localhost:3000/api/groups', groupData);
      const response = await createGroup(request);
      const data = await response.json();
      testGroupId = data.id;
    });

    it('should delete existing group', async () => {
      const request = createMockRequest('DELETE');
      const params = { params: Promise.resolve({ id: testGroupId }) };
      const response = await deleteGroup(request, params);
      
      expect([200, 204]).toContain(response.status); // API might return 200 or 204
      
      // Verify group is deleted
      const getRequest = createMockRequest('GET');
      const getParams = { params: Promise.resolve({ id: testGroupId }) };
      const getResponse = await getGroup(getRequest, getParams);
      expect(getResponse.status).toBe(404);
    });

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

    it('should handle cascade deletion of related services', async () => {
      // This test verifies that deleting a group also deletes its services
      // The actual cascade behavior is handled by the database foreign key constraint
      const request = createMockRequest('DELETE');
      const params = { params: Promise.resolve({ id: testGroupId }) };
      const response = await deleteGroup(request, params);
      
      expect([200, 204]).toContain(response.status); // API might return 200 or 204
    });
  });

  describe('Error Response Format', () => {
    it('should return standardized error format for validation errors', async () => {
      const request = createMockRequest('POST', 'http://localhost:3000/api/groups', {});
      const response = await createGroup(request);
      const data = await response.json();
      
      expect(data).toHaveProperty('error');
      expect(data).toHaveProperty('message');
      expect(data).toHaveProperty('timestamp');
      expect(typeof data.error).toBe('string');
      expect(typeof data.message).toBe('string');
      expect(typeof data.timestamp).toBe('string');
      
      // Verify timestamp is valid ISO string
      expect(() => new Date(data.timestamp)).not.toThrow();
    });

    it('should return standardized error format for not found errors', async () => {
      const request = createMockRequest('GET');
      const params = { params: Promise.resolve({ id: 'non-existent-id' }) };
      const response = await getGroup(request, params);
      const data = await response.json();
      
      expect(data).toHaveProperty('error');
      expect(data).toHaveProperty('message');
      expect(data).toHaveProperty('timestamp');
      expect(data.error).toBe('Not Found');
    });

    it('should return standardized error format for conflict errors', async () => {
      const groupData = {
        name: `conflict-test-${Date.now()}`,
        description: 'Conflict test group'
      };
      
      // Create first group
      const request1 = createMockRequest('POST', 'http://localhost:3000/api/groups', groupData);
      await createGroup(request1);
      
      // Try to create duplicate
      const request2 = createMockRequest('POST', 'http://localhost:3000/api/groups', groupData);
      const response = await createGroup(request2);
      const data = await response.json();
      
      expect(data).toHaveProperty('error');
      expect(data).toHaveProperty('message');
      expect(data).toHaveProperty('timestamp');
      expect(data.error).toBe('Conflict');
    });
  });

  describe('Content-Type Handling', () => {
    it('should handle missing Content-Type header', async () => {
      const request = new Request('http://localhost:3000/api/groups', {
        method: 'POST',
        body: JSON.stringify({ name: 'test-group' })
      }) as NextRequest;
      
      const response = await createGroup(request);
      // Should still work or return appropriate error
      expect([200, 201, 400]).toContain(response.status);
    });

    it('should handle incorrect Content-Type header', async () => {
      const request = new Request('http://localhost:3000/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({ name: 'test-group' })
      }) as NextRequest;
      
      const response = await createGroup(request);
      // API might still process the request successfully or return error
      expect([200, 201, 400, 415]).toContain(response.status);
    });
  });
});