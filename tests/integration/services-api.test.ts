/**
 * Integration tests for Services API endpoints
 */

import { NextRequest } from 'next/server';
import { GET as getServices, POST as createService } from '../../app/api/services/route';
import { GET as getService, PUT as updateService, DELETE as deleteService } from '../../app/api/services/[id]/route';
import { GET as getServicesByGroup } from '../../app/api/groups/[id]/services/route';
import { POST as createGroup } from '../../app/api/groups/route';
import { databaseManager } from '../../api/database';

// Helper function to create mock NextRequest
const createMockRequest = (method: string, url: string, body?: any): NextRequest => {
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

describe('Services API Route Handlers', () => {
  let testGroupId: string;

  beforeEach(async () => {
    // Reset database for each test to ensure clean state
    await databaseManager.resetDatabase();
    
    // Create a test group for services
    const groupRequest = createMockRequest('POST', 'http://localhost:3000/api/groups', {
      name: 'test-group',
      description: 'Test group for services'
    });
    
    const groupResponse = await createGroup(groupRequest);
    const groupData = await groupResponse.json();
    testGroupId = groupData.id;
  });

  describe('GET /api/services', () => {
    it('should return empty array when no services exist', async () => {
      const request = new NextRequest('http://localhost:3000/api/services');
      const response = await getServices(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(0);
    });

    it('should return services with filtering by groupId', async () => {
      // Create a test service
      const serviceRequest = new NextRequest('http://localhost:3000/api/services', {
        method: 'POST',
        body: JSON.stringify({
          groupId: testGroupId,
          name: 'test-service',
          domain: 'test.example.com',
          internalPorts: [8080],
          externalPorts: [80],
          vlan: 'vlan-100',
          cidr: '192.168.1.0/24',
          ipAddress: '192.168.1.10',
          tags: ['web', 'api']
        })
      });
      await createService(serviceRequest);

      // Test filtering by groupId
      const request = new NextRequest(`http://localhost:3000/api/services?groupId=${testGroupId}`);
      const response = await getServices(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(1);
      expect(data[0].groupId).toBe(testGroupId);
    });

    it('should return services with filtering by vlan', async () => {
      // Create a test service
      const serviceRequest = new NextRequest('http://localhost:3000/api/services', {
        method: 'POST',
        body: JSON.stringify({
          groupId: testGroupId,
          name: 'test-service',
          domain: 'test.example.com',
          internalPorts: [8080],
          externalPorts: [80],
          vlan: 'vlan-100',
          tags: ['web']
        })
      });
      await createService(serviceRequest);

      // Test filtering by vlan
      const request = new NextRequest('http://localhost:3000/api/services?vlan=vlan-100');
      const response = await getServices(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(1);
      expect(data[0].vlan).toBe('vlan-100');
    });

    it('should return services with filtering by tags', async () => {
      // Create a test service
      const serviceRequest = new NextRequest('http://localhost:3000/api/services', {
        method: 'POST',
        body: JSON.stringify({
          groupId: testGroupId,
          name: 'test-service',
          domain: 'test.example.com',
          internalPorts: [8080],
          externalPorts: [80],
          tags: ['web', 'api']
        })
      });
      await createService(serviceRequest);

      // Test filtering by tags
      const request = new NextRequest('http://localhost:3000/api/services?tags=web,database');
      const response = await getServices(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(1);
      expect(data[0].tags).toContain('web');
    });

    it('should return 400 for invalid filter parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/services?groupId=non-existent-group');
      const response = await getServices(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Bad Request');
    });
  });

  describe('POST /api/services', () => {
    it('should create a new service with valid data', async () => {
      const serviceData = {
        groupId: testGroupId,
        name: 'test-service',
        domain: 'test.example.com',
        internalPorts: [8080, 8081],
        externalPorts: [80, 443],
        vlan: 'vlan-100',
        cidr: '192.168.1.0/24',
        ipAddress: '192.168.1.10',
        tags: ['web', 'api']
      };

      const request = new NextRequest('http://localhost:3000/api/services', {
        method: 'POST',
        body: JSON.stringify(serviceData)
      });

      const response = await createService(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toBeDefined();
      expect(data.name).toBe(serviceData.name);
      expect(data.domain).toBe(serviceData.domain);
      expect(data.groupId).toBe(testGroupId);
      expect(data.internalPorts).toEqual(serviceData.internalPorts);
      expect(data.externalPorts).toEqual(serviceData.externalPorts);
      expect(data.vlan).toBe(serviceData.vlan);
      expect(data.cidr).toBe(serviceData.cidr);
      expect(data.ipAddress).toBe(serviceData.ipAddress);
      expect(data.tags).toEqual(serviceData.tags);
    });

    it('should return 400 for invalid data', async () => {
      const request = new NextRequest('http://localhost:3000/api/services', {
        method: 'POST',
        body: JSON.stringify({
          // Missing required fields
          name: 'test-service'
        })
      });

      const response = await createService(request);
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBe('Bad Request');
      expect(data.message).toContain('Validation failed');
    });

    it('should return 400 for non-existent group', async () => {
      const request = new NextRequest('http://localhost:3000/api/services', {
        method: 'POST',
        body: JSON.stringify({
          groupId: 'non-existent-group',
          name: 'test-service',
          domain: 'test.example.com',
          internalPorts: [8080],
          externalPorts: [80]
        })
      });

      const response = await createService(request);
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBe('Bad Request');
      expect(data.message).toContain('does not exist');
    });
  });

  describe('GET /api/services/[id]', () => {
    it('should return 404 for non-existent service', async () => {
      const response = await getService(
        new NextRequest('http://localhost:3000/api/services/non-existent-id'),
        { params: Promise.resolve({ id: 'non-existent-id' }) }
      );

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe('Not Found');
    });

    it('should return 400 for empty ID', async () => {
      const response = await getService(
        new NextRequest('http://localhost:3000/api/services/'),
        { params: Promise.resolve({ id: '' }) }
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Bad Request');
    });
  });

  describe('PUT /api/services/[id]', () => {
    it('should return 404 for non-existent service', async () => {
      const request = new NextRequest('http://localhost:3000/api/services/non-existent-id', {
        method: 'PUT',
        body: JSON.stringify({ name: 'updated-name' })
      });

      const response = await updateService(
        request,
        { params: Promise.resolve({ id: 'non-existent-id' }) }
      );

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe('Not Found');
    });

    it('should return 400 for invalid data', async () => {
      const request = new NextRequest('http://localhost:3000/api/services/some-id', {
        method: 'PUT',
        body: JSON.stringify({ 
          internalPorts: ['invalid-port'] // Should be numbers
        })
      });

      const response = await updateService(
        request,
        { params: Promise.resolve({ id: 'some-id' }) }
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Bad Request');
    });
  });

  describe('DELETE /api/services/[id]', () => {
    it('should return 404 for non-existent service', async () => {
      const response = await deleteService(
        new NextRequest('http://localhost:3000/api/services/non-existent-id'),
        { params: Promise.resolve({ id: 'non-existent-id' }) }
      );

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe('Not Found');
    });

    it('should return 400 for empty ID', async () => {
      const response = await deleteService(
        new NextRequest('http://localhost:3000/api/services/'),
        { params: Promise.resolve({ id: '' }) }
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Bad Request');
    });
  });

  describe('GET /api/groups/[id]/services', () => {
    it('should return empty array for group with no services', async () => {
      const response = await getServicesByGroup(
        new NextRequest(`http://localhost:3000/api/groups/${testGroupId}/services`),
        { params: Promise.resolve({ id: testGroupId }) }
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(0);
    });

    it('should return 400 for non-existent group', async () => {
      const response = await getServicesByGroup(
        new NextRequest('http://localhost:3000/api/groups/non-existent-group/services'),
        { params: Promise.resolve({ id: 'non-existent-group' }) }
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Bad Request');
      expect(data.message).toContain('does not exist');
    });

    it('should return 400 for empty group ID', async () => {
      const response = await getServicesByGroup(
        new NextRequest('http://localhost:3000/api/groups//services'),
        { params: Promise.resolve({ id: '' }) }
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Bad Request');
    });
  });

  describe('Error Response Format', () => {
    it('should return standardized error format', async () => {
      const request = new NextRequest('http://localhost:3000/api/services', {
        method: 'POST',
        body: JSON.stringify({}) // Invalid empty body
      });

      const response = await createService(request);
      const data = await response.json();

      expect(data).toHaveProperty('error');
      expect(data).toHaveProperty('message');
      expect(data).toHaveProperty('timestamp');
      expect(typeof data.timestamp).toBe('string');
    });
  });
});