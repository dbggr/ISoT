/**
 * Unit tests for NetworkServiceRepository
 */

import { randomUUID } from 'crypto';
import { SQLiteNetworkServiceRepository } from '../../../api/repositories/NetworkServiceRepository';
import { SQLiteGroupRepository } from '../../../api/repositories/GroupRepository';
import type { CreateNetworkServiceDto, UpdateNetworkServiceDto, ServiceFilters } from '../../../api/models/NetworkService';
import type { CreateGroupDto } from '../../../api/models/Group';
import { getDatabase, closeDatabase } from '../../../api/database/connection';
import { ValidationError, NotFoundError } from '../../../api/utils/errors';
import fs from 'fs';
import path from 'path';

describe('NetworkServiceRepository', () => {
  let repository: SQLiteNetworkServiceRepository;
  let groupRepository: SQLiteGroupRepository;
  let testDbPath: string;
  let testGroupId: string;

  beforeAll(async () => {
    // Create a unique test database file
    testDbPath = path.join(process.cwd(), 'data', `test-${randomUUID()}.db`);
    process.env.DATABASE_PATH = testDbPath;
  });

  beforeEach(async () => {
    repository = new SQLiteNetworkServiceRepository();
    groupRepository = new SQLiteGroupRepository();

    // Initialize database schema
    const db = getDatabase();

    // Create tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS groups (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS network_services (
        id TEXT PRIMARY KEY,
        group_id TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        domain TEXT NOT NULL,
        internal_ports TEXT,
        external_ports TEXT,
        vlan TEXT,
        cidr TEXT,
        ip_address TEXT,
        tags TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
      );
    `);

    // Create a test group
    const testGroup: CreateGroupDto = {
      name: 'test-group',
      description: 'Test group for network services'
    };
    const createdGroup = await groupRepository.create(testGroup);
    testGroupId = createdGroup.id;
  });

  afterEach(async () => {
    closeDatabase();

    // Clean up test database file
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  afterAll(() => {
    delete process.env.DATABASE_PATH;
  });

  describe('create', () => {
    it('should create a network service with all fields', async () => {
      const serviceData: CreateNetworkServiceDto = {
        groupId: testGroupId,
        name: 'test-service',
        type: 'web',
        domain: 'test.example.com',
        internalPorts: [8080, 8443],
        externalPorts: [80, 443],
        vlan: 'vlan-100',
        cidr: '192.168.1.0/24',
        ipAddress: '192.168.1.10',
        tags: ['web', 'api']
      };

      const result = await repository.create(serviceData);

      expect(result).toMatchObject({
        groupId: testGroupId,
        name: 'test-service',
        type: 'web',
        domain: 'test.example.com',
        internalPorts: [8080, 8443],
        externalPorts: [80, 443],
        vlan: 'vlan-100',
        cidr: '192.168.1.0/24',
        ipAddress: '192.168.1.10',
        tags: ['web', 'api']
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a network service with minimal required fields', async () => {
      const serviceData: CreateNetworkServiceDto = {
        groupId: testGroupId,
        name: 'minimal-service',
        type: 'api',
        domain: 'minimal.example.com',
        internalPorts: [3000],
        externalPorts: [3000]
      };

      const result = await repository.create(serviceData);

      expect(result).toMatchObject({
        groupId: testGroupId,
        name: 'minimal-service',
        type: 'api',
        domain: 'minimal.example.com',
        internalPorts: [3000],
        externalPorts: [3000],
        vlan: '',
        cidr: '',
        ipAddress: '',
        tags: []
      });
    });

    it('should throw ValidationError when group does not exist', async () => {
      const serviceData: CreateNetworkServiceDto = {
        groupId: 'non-existent-group',
        name: 'test-service',
        type: 'web',
        domain: 'test.example.com',
        internalPorts: [8080],
        externalPorts: [80]
      };

      await expect(repository.create(serviceData)).rejects.toThrow(ValidationError);
    });
  });

  describe('findById', () => {
    it('should find an existing network service', async () => {
      const serviceData: CreateNetworkServiceDto = {
        groupId: testGroupId,
        name: 'findable-service',
        type: 'web',
        domain: 'findable.example.com',
        internalPorts: [8080],
        externalPorts: [80],
        tags: ['findable']
      };

      const created = await repository.create(serviceData);
      const found = await repository.findById(created.id);

      expect(found).toEqual(created);
    });

    it('should return null for non-existent service', async () => {
      const result = await repository.findById('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    beforeEach(async () => {
      // Create test services
      const services: CreateNetworkServiceDto[] = [
        {
          groupId: testGroupId,
          name: 'web-service',
          type: 'web',
          domain: 'web.example.com',
          internalPorts: [8080],
          externalPorts: [80],
          vlan: 'vlan-100',
          ipAddress: '192.168.1.10',
          tags: ['web', 'frontend']
        },
        {
          groupId: testGroupId,
          name: 'api-service',
          type: 'api',
          domain: 'api.example.com',
          internalPorts: [3000],
          externalPorts: [443],
          vlan: 'vlan-200',
          ipAddress: '192.168.2.10',
          tags: ['api', 'backend']
        },
        {
          groupId: testGroupId,
          name: 'db-service',
          type: 'database',
          domain: 'db.example.com',
          internalPorts: [5432],
          externalPorts: [5432],
          vlan: 'vlan-100',
          cidr: '10.0.0.0/16',
          tags: ['database']
        }
      ];

      for (const service of services) {
        await repository.create(service);
      }
    });

    it('should return all services when no filters applied', async () => {
      const result = await repository.findAll();
      expect(result).toHaveLength(3);
      expect(result.map(s => s.name).sort()).toEqual(['api-service', 'db-service', 'web-service']);
    });

    it('should filter by groupId', async () => {
      const filters: ServiceFilters = { groupId: testGroupId };
      const result = await repository.findAll(filters);
      expect(result).toHaveLength(3);
      expect(result.every(s => s.groupId === testGroupId)).toBe(true);
    });

    it('should filter by vlan', async () => {
      const filters: ServiceFilters = { vlan: 'vlan-100' };
      const result = await repository.findAll(filters);
      expect(result).toHaveLength(2);
      expect(result.every(s => s.vlan === 'vlan-100')).toBe(true);
    });

    it('should filter by ipAddress', async () => {
      const filters: ServiceFilters = { ipAddress: '192.168.1.10' };
      const result = await repository.findAll(filters);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('web-service');
    });

    it('should filter by domain pattern', async () => {
      const filters: ServiceFilters = { domain: 'api' };
      const result = await repository.findAll(filters);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('api-service');
    });

    it('should filter by cidrRange', async () => {
      const filters: ServiceFilters = { cidrRange: '10.0.0' };
      const result = await repository.findAll(filters);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('db-service');
    });

    it('should filter by single tag', async () => {
      const filters: ServiceFilters = { tags: ['web'] };
      const result = await repository.findAll(filters);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('web-service');
    });

    it('should filter by multiple tags (OR logic)', async () => {
      const filters: ServiceFilters = { tags: ['web', 'database'] };
      const result = await repository.findAll(filters);
      expect(result).toHaveLength(2);
      expect(result.map(s => s.name).sort()).toEqual(['db-service', 'web-service']);
    });

    it('should combine multiple filters (AND logic)', async () => {
      const filters: ServiceFilters = {
        vlan: 'vlan-100',
        tags: ['web']
      };
      const result = await repository.findAll(filters);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('web-service');
    });
  });

  describe('update', () => {
    let serviceId: string;

    beforeEach(async () => {
      const serviceData: CreateNetworkServiceDto = {
        groupId: testGroupId,
        name: 'updatable-service',
        type: 'web',
        domain: 'updatable.example.com',
        internalPorts: [8080],
        externalPorts: [80],
        vlan: 'vlan-100',
        tags: ['original']
      };
      const created = await repository.create(serviceData);
      serviceId = created.id;
    });

    it('should update all fields', async () => {
      const updates: UpdateNetworkServiceDto = {
        name: 'updated-service',
        domain: 'updated.example.com',
        internalPorts: [9000, 9001],
        externalPorts: [443, 444],
        vlan: 'vlan-200',
        cidr: '10.0.0.0/8',
        ipAddress: '10.0.0.1',
        tags: ['updated', 'modified']
      };

      // Add a small delay to ensure timestamps differ
      await new Promise(resolve => setTimeout(resolve, 10));
      const result = await repository.update(serviceId, updates);

      expect(result).toMatchObject(updates);
      expect(result.updatedAt.getTime()).toBeGreaterThan(result.createdAt.getTime());
    });

    it('should update individual fields', async () => {
      const updates: UpdateNetworkServiceDto = {
        name: 'partially-updated'
      };

      const result = await repository.update(serviceId, updates);

      expect(result.name).toBe('partially-updated');
      expect(result.domain).toBe('updatable.example.com'); // unchanged
    });

    it('should handle empty updates', async () => {
      const original = await repository.findById(serviceId);
      const result = await repository.update(serviceId, {});

      expect(result).toEqual(original);
    });

    it('should validate group exists when updating groupId', async () => {
      const updates: UpdateNetworkServiceDto = {
        groupId: 'non-existent-group'
      };

      await expect(repository.update(serviceId, updates)).rejects.toThrow(ValidationError);
    });

    it('should throw NotFoundError for non-existent service', async () => {
      const updates: UpdateNetworkServiceDto = {
        name: 'updated-name'
      };

      await expect(repository.update('non-existent-id', updates)).rejects.toThrow(NotFoundError);
    });
  });

  describe('delete', () => {
    it('should delete an existing service', async () => {
      const serviceData: CreateNetworkServiceDto = {
        groupId: testGroupId,
        name: 'deletable-service',
        type: 'web',
        domain: 'deletable.example.com',
        internalPorts: [8080],
        externalPorts: [80]
      };

      const created = await repository.create(serviceData);
      const deleted = await repository.delete(created.id);

      expect(deleted).toBe(true);

      const found = await repository.findById(created.id);
      expect(found).toBeNull();
    });

    it('should return false for non-existent service', async () => {
      const result = await repository.delete('non-existent-id');
      expect(result).toBe(false);
    });
  });

  describe('findByGroupId', () => {
    let secondGroupId: string;

    beforeEach(async () => {
      // Create a second group
      const secondGroup = await groupRepository.create({
        name: 'second-group',
        description: 'Second test group'
      });
      secondGroupId = secondGroup.id;

      // Create services in both groups
      await repository.create({
        groupId: testGroupId,
        name: 'service-1',
        type: 'web',
        domain: 'service1.example.com',
        internalPorts: [8080],
        externalPorts: [80]
      });

      await repository.create({
        groupId: testGroupId,
        name: 'service-2',
        type: 'api',
        domain: 'service2.example.com',
        internalPorts: [3000],
        externalPorts: [3000]
      });

      await repository.create({
        groupId: secondGroupId,
        name: 'service-3',
        type: 'database',
        domain: 'service3.example.com',
        internalPorts: [5000],
        externalPorts: [5000]
      });
    });

    it('should return services for specific group', async () => {
      const result = await repository.findByGroupId(testGroupId);
      expect(result).toHaveLength(2);
      expect(result.every(s => s.groupId === testGroupId)).toBe(true);
      expect(result.map(s => s.name).sort()).toEqual(['service-1', 'service-2']);
    });

    it('should return empty array for group with no services', async () => {
      const emptyGroup = await groupRepository.create({
        name: 'empty-group',
        description: 'Group with no services'
      });

      const result = await repository.findByGroupId(emptyGroup.id);
      expect(result).toHaveLength(0);
    });

    it('should return empty array for non-existent group', async () => {
      const result = await repository.findByGroupId('non-existent-group');
      expect(result).toHaveLength(0);
    });
  });

  describe('JSON serialization/deserialization', () => {
    it('should handle empty arrays correctly', async () => {
      const serviceData: CreateNetworkServiceDto = {
        groupId: testGroupId,
        name: 'empty-arrays-service',
        type: 'web',
        domain: 'empty.example.com',
        internalPorts: [],
        externalPorts: [],
        tags: []
      };

      const result = await repository.create(serviceData);

      expect(result.internalPorts).toEqual([]);
      expect(result.externalPorts).toEqual([]);
      expect(result.tags).toEqual([]);
    });

    it('should handle malformed JSON gracefully', async () => {
      // This test directly manipulates the database to simulate malformed JSON
      const db = getDatabase();
      const serviceId = randomUUID();

      db.prepare(`
        INSERT INTO network_services (
          id, group_id, name, type, domain, internal_ports, external_ports, tags,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        serviceId,
        testGroupId,
        'malformed-json-service',
        'web',
        'malformed.example.com',
        'invalid-json',
        '[1,2,3]',
        'also-invalid',
        new Date().toISOString(),
        new Date().toISOString()
      );

      const result = await repository.findById(serviceId);

      expect(result).not.toBeNull();
      expect(result!.internalPorts).toEqual([]);
      expect(result!.externalPorts).toEqual([1, 2, 3]);
      expect(result!.tags).toEqual([]);
    });

    it('should filter out non-numeric values from port arrays', async () => {
      // This test directly manipulates the database to simulate mixed-type arrays
      const db = getDatabase();
      const serviceId = randomUUID();

      db.prepare(`
        INSERT INTO network_services (
          id, group_id, name, type, domain, internal_ports, external_ports, tags,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        serviceId,
        testGroupId,
        'mixed-types-service',
        'web',
        'mixed.example.com',
        JSON.stringify([8080, 'invalid', 9000, null, 9001]),
        JSON.stringify([80, 443]),
        JSON.stringify(['tag1', 123, 'tag2', null, 'tag3']),
        new Date().toISOString(),
        new Date().toISOString()
      );

      const result = await repository.findById(serviceId);

      expect(result).not.toBeNull();
      expect(result!.internalPorts).toEqual([8080, 9000, 9001]);
      expect(result!.externalPorts).toEqual([80, 443]);
      expect(result!.tags).toEqual(['tag1', 'tag2', 'tag3']);
    });


  });
});