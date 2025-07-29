/**
 * Unit tests for validation middleware
 */

import { NextRequest } from 'next/server';
import { 
  validateRequestBody, 
  validateQueryParams,
  validateCreateGroup,
  validateUpdateGroup,
  validateCreateNetworkService,
  validateUpdateNetworkService,
  validateServiceFilters
} from '../../../api/middleware/validation';
import { CreateGroupSchema, CreateNetworkServiceSchema } from '../../../api/utils/schemas';

// Mock logger to avoid console output during tests
jest.mock('../../../api/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
  }
}));

describe('Validation Middleware', () => {
  describe('validateRequestBody', () => {
    it('should validate valid request body', async () => {
      const validData = { name: 'test-group', description: 'Test description' };
      const request = new NextRequest('http://localhost/api/groups', {
        method: 'POST',
        body: JSON.stringify(validData),
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await validateRequestBody(request, CreateGroupSchema);
      
      expect(result.isValid).toBe(true);
      if (result.isValid) {
        expect(result.data.name).toBe('test-group');
        expect(result.data.description).toBe('Test description');
      }
    });

    it('should reject invalid request body', async () => {
      const invalidData = { name: '' }; // Empty name should fail validation
      const request = new NextRequest('http://localhost/api/groups', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await validateRequestBody(request, CreateGroupSchema);
      
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.response.status).toBe(400);
      }
    });

    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost/api/groups', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await validateRequestBody(request, CreateGroupSchema);
      
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.response.status).toBe(500);
      }
    });
  });

  describe('validateQueryParams', () => {
    it('should validate valid query parameters', () => {
      const request = new NextRequest('http://localhost/api/services?groupId=test&vlan=100');

      const result = validateQueryParams(request, CreateGroupSchema.partial());
      
      expect(result.isValid).toBe(true);
    });

    it('should handle comma-separated tags', () => {
      const request = new NextRequest('http://localhost/api/services?tags=web,api,database');

      const mockSchema = CreateGroupSchema.extend({
        tags: CreateGroupSchema.shape.name.array().optional()
      }).partial();

      const result = validateQueryParams(request, mockSchema);
      
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateCreateGroup', () => {
    it('should validate valid group creation data', async () => {
      const validData = { name: 'test-group', description: 'Test description' };
      const request = new NextRequest('http://localhost/api/groups', {
        method: 'POST',
        body: JSON.stringify(validData),
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await validateCreateGroup(request);
      
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid group creation data', async () => {
      const invalidData = { name: '', description: 'Test' };
      const request = new NextRequest('http://localhost/api/groups', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await validateCreateGroup(request);
      
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateCreateNetworkService', () => {
    it('should validate valid service creation data', async () => {
      const validData = {
        groupId: 'test-group',
        name: 'test-service',
        domain: 'example.com',
        internalPorts: [8080],
        externalPorts: [80],
        vlan: '100',
        cidr: '192.168.1.0/24',
        ipAddress: '192.168.1.10',
        tags: ['web', 'api']
      };
      const request = new NextRequest('http://localhost/api/services', {
        method: 'POST',
        body: JSON.stringify(validData),
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await validateCreateNetworkService(request);
      
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid service creation data', async () => {
      const invalidData = {
        groupId: '',
        name: 'test-service',
        domain: 'example.com',
        internalPorts: ['invalid'], // Should be numbers
        externalPorts: [80]
      };
      const request = new NextRequest('http://localhost/api/services', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await validateCreateNetworkService(request);
      
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateServiceFilters', () => {
    it('should validate valid service filter parameters', () => {
      const request = new NextRequest('http://localhost/api/services?groupId=test&vlan=100&tags=web,api');

      const result = validateServiceFilters(request);
      
      expect(result.isValid).toBe(true);
    });

    it('should handle empty query parameters', () => {
      const request = new NextRequest('http://localhost/api/services');

      const result = validateServiceFilters(request);
      
      expect(result.isValid).toBe(true);
    });
  });
});