/**
 * Unit tests for GroupRepository
 */

import { SQLiteGroupRepository } from '../../../api/repositories/GroupRepository';
import { getDatabase, closeDatabase } from '../../../api/database/connection';
import { DatabaseError, NotFoundError, ConflictError } from '../../../api/utils/errors';
import type { CreateGroupDto, UpdateGroupDto } from '../../../api/models/Group';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

describe('GroupRepository', () => {
  let repository: SQLiteGroupRepository;
  let testDbPath: string;

  beforeAll(() => {
    // Create a test database path
    testDbPath = path.join(__dirname, '../../fixtures/test-groups.db');
    
    // Ensure test directory exists
    const testDir = path.dirname(testDbPath);
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    // Set test database path
    process.env.DATABASE_PATH = testDbPath;
  });

  beforeEach(async () => {
    // Clean up any existing database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }

    // Initialize database with schema
    const db = getDatabase();
    
    // Create groups table
    db.exec(`
      CREATE TABLE groups (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TRIGGER update_groups_updated_at
        AFTER UPDATE ON groups
        FOR EACH ROW
      BEGIN
        UPDATE groups SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END;
    `);

    repository = new SQLiteGroupRepository();
  });

  afterEach(() => {
    closeDatabase();
  });

  afterAll(() => {
    // Clean up test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('create', () => {
    it('should create a new group successfully', async () => {
      const groupData: CreateGroupDto = {
        name: 'Test Group',
        description: 'A test group'
      };

      const result = await repository.create(groupData);

      expect(result).toMatchObject({
        name: 'Test Group',
        description: 'A test group'
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a group without description', async () => {
      const groupData: CreateGroupDto = {
        name: 'Test Group'
      };

      const result = await repository.create(groupData);

      expect(result.name).toBe('Test Group');
      expect(result.description).toBeUndefined();
      expect(result.id).toBeDefined();
    });

    it('should throw ConflictError for duplicate group names', async () => {
      const groupData: CreateGroupDto = {
        name: 'Duplicate Group'
      };

      await repository.create(groupData);

      await expect(repository.create(groupData))
        .rejects
        .toThrow(ConflictError);
    });

    it('should handle database errors gracefully', async () => {
      // Create a repository with an invalid database path to simulate error
      const originalPath = process.env.DATABASE_PATH;
      process.env.DATABASE_PATH = '/invalid/path/that/does/not/exist.db';
      
      // Close existing database connection
      closeDatabase();
      
      const newRepository = new SQLiteGroupRepository();
      const groupData: CreateGroupDto = {
        name: 'Test Group'
      };

      await expect(newRepository.create(groupData))
        .rejects
        .toThrow(DatabaseError);
        
      // Restore original path
      process.env.DATABASE_PATH = originalPath;
    });
  });

  describe('findById', () => {
    it('should find an existing group by id', async () => {
      const groupData: CreateGroupDto = {
        name: 'Test Group',
        description: 'A test group'
      };

      const created = await repository.create(groupData);
      const found = await repository.findById(created.id);

      expect(found).toMatchObject({
        id: created.id,
        name: 'Test Group',
        description: 'A test group'
      });
    });

    it('should return null for non-existent group', async () => {
      const result = await repository.findById('non-existent-id');
      expect(result).toBeNull();
    });

    it('should handle database errors gracefully', async () => {
      // Create a repository with an invalid database path to simulate error
      const originalPath = process.env.DATABASE_PATH;
      process.env.DATABASE_PATH = '/invalid/path/that/does/not/exist.db';
      
      // Close existing database connection
      closeDatabase();
      
      const newRepository = new SQLiteGroupRepository();

      await expect(newRepository.findById('some-id'))
        .rejects
        .toThrow(DatabaseError);
        
      // Restore original path
      process.env.DATABASE_PATH = originalPath;
    });
  });

  describe('findAll', () => {
    it('should return empty array when no groups exist', async () => {
      const result = await repository.findAll();
      expect(result).toEqual([]);
    });

    it('should return all groups ordered by name', async () => {
      await repository.create({ name: 'Zebra Group' });
      await repository.create({ name: 'Alpha Group' });
      await repository.create({ name: 'Beta Group' });

      const result = await repository.findAll();

      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('Alpha Group');
      expect(result[1].name).toBe('Beta Group');
      expect(result[2].name).toBe('Zebra Group');
    });

    it('should handle database errors gracefully', async () => {
      // Create a repository with an invalid database path to simulate error
      const originalPath = process.env.DATABASE_PATH;
      process.env.DATABASE_PATH = '/invalid/path/that/does/not/exist.db';
      
      // Close existing database connection
      closeDatabase();
      
      const newRepository = new SQLiteGroupRepository();

      await expect(newRepository.findAll())
        .rejects
        .toThrow(DatabaseError);
        
      // Restore original path
      process.env.DATABASE_PATH = originalPath;
    });
  });

  describe('update', () => {
    it('should update group name successfully', async () => {
      const created = await repository.create({ name: 'Original Name' });
      const updates: UpdateGroupDto = { name: 'Updated Name' };

      const result = await repository.update(created.id, updates);

      expect(result.name).toBe('Updated Name');
      expect(result.id).toBe(created.id);
      expect(result.createdAt).toEqual(created.createdAt);
      // The updated_at should be set to a recent timestamp
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should update group description successfully', async () => {
      const created = await repository.create({ name: 'Test Group' });
      const updates: UpdateGroupDto = { description: 'New description' };

      const result = await repository.update(created.id, updates);

      expect(result.description).toBe('New description');
      expect(result.name).toBe('Test Group');
    });

    it('should update both name and description', async () => {
      const created = await repository.create({ name: 'Test Group' });
      const updates: UpdateGroupDto = {
        name: 'Updated Name',
        description: 'Updated description'
      };

      const result = await repository.update(created.id, updates);

      expect(result.name).toBe('Updated Name');
      expect(result.description).toBe('Updated description');
    });

    it('should return existing group when no updates provided', async () => {
      const created = await repository.create({ name: 'Test Group' });
      const updates: UpdateGroupDto = {};

      const result = await repository.update(created.id, updates);

      expect(result).toEqual(created);
    });

    it('should throw NotFoundError for non-existent group', async () => {
      const updates: UpdateGroupDto = { name: 'Updated Name' };

      await expect(repository.update('non-existent-id', updates))
        .rejects
        .toThrow(NotFoundError);
    });

    it('should throw ConflictError for duplicate name', async () => {
      await repository.create({ name: 'Existing Group' });
      const created = await repository.create({ name: 'Test Group' });
      
      const updates: UpdateGroupDto = { name: 'Existing Group' };

      await expect(repository.update(created.id, updates))
        .rejects
        .toThrow(ConflictError);
    });
  });

  describe('delete', () => {
    it('should delete an existing group successfully', async () => {
      const created = await repository.create({ name: 'Test Group' });

      const result = await repository.delete(created.id);

      expect(result).toBe(true);

      // Verify group is deleted
      const found = await repository.findById(created.id);
      expect(found).toBeNull();
    });

    it('should return false for non-existent group', async () => {
      const result = await repository.delete('non-existent-id');
      expect(result).toBe(false);
    });

    it('should throw ConflictError when group has foreign key constraints', async () => {
      // First create the network_services table to test foreign key constraint
      const db = getDatabase();
      db.exec(`
        CREATE TABLE network_services (
          id TEXT PRIMARY KEY,
          group_id TEXT NOT NULL,
          name TEXT NOT NULL,
          domain TEXT NOT NULL,
          FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
        );
      `);

      const created = await repository.create({ name: 'Test Group' });
      
      // Insert a network service that references this group
      db.prepare(`
        INSERT INTO network_services (id, group_id, name, domain)
        VALUES (?, ?, ?, ?)
      `).run('service-1', created.id, 'Test Service', 'test.com');

      // Disable foreign key constraints to simulate the error condition
      db.pragma('foreign_keys = OFF');
      db.exec(`
        CREATE TRIGGER prevent_group_delete
        BEFORE DELETE ON groups
        FOR EACH ROW
        WHEN EXISTS (SELECT 1 FROM network_services WHERE group_id = OLD.id)
        BEGIN
          SELECT RAISE(ABORT, 'FOREIGN KEY constraint failed');
        END;
      `);

      await expect(repository.delete(created.id))
        .rejects
        .toThrow(ConflictError);
    });
  });

  describe('findByName', () => {
    it('should find an existing group by name', async () => {
      const created = await repository.create({
        name: 'Test Group',
        description: 'A test group'
      });

      const found = await repository.findByName('Test Group');

      expect(found).toMatchObject({
        id: created.id,
        name: 'Test Group',
        description: 'A test group'
      });
    });

    it('should return null for non-existent group name', async () => {
      const result = await repository.findByName('Non-existent Group');
      expect(result).toBeNull();
    });

    it('should be case sensitive', async () => {
      await repository.create({ name: 'Test Group' });

      const result = await repository.findByName('test group');
      expect(result).toBeNull();
    });

    it('should handle database errors gracefully', async () => {
      // Create a repository with an invalid database path to simulate error
      const originalPath = process.env.DATABASE_PATH;
      process.env.DATABASE_PATH = '/invalid/path/that/does/not/exist.db';
      
      // Close existing database connection
      closeDatabase();
      
      const newRepository = new SQLiteGroupRepository();

      await expect(newRepository.findByName('Test Group'))
        .rejects
        .toThrow(DatabaseError);
        
      // Restore original path
      process.env.DATABASE_PATH = originalPath;
    });
  });
});