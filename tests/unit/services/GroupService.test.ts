/**
 * Unit tests for GroupService
 */

import { DefaultGroupService } from '../../../api/services/GroupService';
import type { GroupRepository } from '../../../api/repositories/GroupRepository';
import type { Group, CreateGroupDto, UpdateGroupDto } from '../../../api/models/Group';
import { ValidationError, NotFoundError, ConflictError } from '../../../api/utils/errors';

// Mock GroupRepository
class MockGroupRepository implements GroupRepository {
  private groups: Group[] = [];
  private nextId = 1;

  async create(group: CreateGroupDto): Promise<Group> {
    const existingGroup = this.groups.find(g => g.name === group.name);
    if (existingGroup) {
      throw new ConflictError(`Group with name '${group.name}' already exists`);
    }

    const newGroup: Group = {
      id: `group-${this.nextId++}`,
      name: group.name,
      description: group.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.groups.push(newGroup);
    return newGroup;
  }

  async findById(id: string): Promise<Group | null> {
    return this.groups.find(g => g.id === id) || null;
  }

  async findAll(): Promise<Group[]> {
    return [...this.groups].sort((a, b) => a.name.localeCompare(b.name));
  }

  async update(id: string, updates: UpdateGroupDto): Promise<Group> {
    const groupIndex = this.groups.findIndex(g => g.id === id);
    if (groupIndex === -1) {
      throw new NotFoundError('Group', id);
    }

    // Check for name conflicts
    if (updates.name) {
      const existingGroup = this.groups.find(g => g.name === updates.name && g.id !== id);
      if (existingGroup) {
        throw new ConflictError(`Group with name '${updates.name}' already exists`);
      }
    }

    const updatedGroup: Group = {
      ...this.groups[groupIndex],
      ...updates,
      updatedAt: new Date(),
    };

    this.groups[groupIndex] = updatedGroup;
    return updatedGroup;
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = this.groups.length;
    this.groups = this.groups.filter(g => g.id !== id);
    return this.groups.length < initialLength;
  }

  async findByName(name: string): Promise<Group | null> {
    return this.groups.find(g => g.name === name) || null;
  }

  // Test helper methods
  reset(): void {
    this.groups = [];
    this.nextId = 1;
  }

  addGroup(group: Group): void {
    this.groups.push(group);
  }
}

describe('GroupService', () => {
  let groupService: DefaultGroupService;
  let mockRepository: MockGroupRepository;

  beforeEach(() => {
    mockRepository = new MockGroupRepository();
    groupService = new DefaultGroupService(mockRepository);
  });

  afterEach(() => {
    mockRepository.reset();
  });

  describe('createGroup', () => {
    it('should create a group with valid data', async () => {
      const groupData: CreateGroupDto = {
        name: 'test-group',
        description: 'Test group description',
      };

      const result = await groupService.createGroup(groupData);

      expect(result).toMatchObject({
        name: 'test-group',
        description: 'Test group description',
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a group without description', async () => {
      const groupData: CreateGroupDto = {
        name: 'test-group',
      };

      const result = await groupService.createGroup(groupData);

      expect(result.name).toBe('test-group');
      expect(result.description).toBeUndefined();
    });

    it('should throw ValidationError for invalid name', async () => {
      const groupData = {
        name: '', // Empty name
        description: 'Test description',
      };

      await expect(groupService.createGroup(groupData)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for name with invalid characters', async () => {
      const groupData = {
        name: 'test group!', // Contains space and special character
        description: 'Test description',
      };

      await expect(groupService.createGroup(groupData)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for name too long', async () => {
      const groupData = {
        name: 'a'.repeat(101), // Too long
        description: 'Test description',
      };

      await expect(groupService.createGroup(groupData)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for description too long', async () => {
      const groupData = {
        name: 'test-group',
        description: 'a'.repeat(501), // Too long
      };

      await expect(groupService.createGroup(groupData)).rejects.toThrow(ValidationError);
    });

    it('should throw ConflictError for duplicate group name', async () => {
      const groupData: CreateGroupDto = {
        name: 'test-group',
        description: 'Test description',
      };

      await groupService.createGroup(groupData);

      await expect(groupService.createGroup(groupData)).rejects.toThrow(ConflictError);
    });
  });

  describe('getGroup', () => {
    it('should return group by ID', async () => {
      const group: Group = {
        id: 'test-id',
        name: 'test-group',
        description: 'Test description',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.addGroup(group);

      const result = await groupService.getGroup('test-id');

      expect(result).toEqual(group);
    });

    it('should throw NotFoundError for non-existent group', async () => {
      await expect(groupService.getGroup('non-existent')).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError for empty ID', async () => {
      await expect(groupService.getGroup('')).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for non-string ID', async () => {
      await expect(groupService.getGroup(null as any)).rejects.toThrow(ValidationError);
    });
  });

  describe('getAllGroups', () => {
    it('should return empty array when no groups exist', async () => {
      const result = await groupService.getAllGroups();

      expect(result).toEqual([]);
    });

    it('should return all groups sorted by name', async () => {
      const groups: Group[] = [
        {
          id: 'id-2',
          name: 'zebra-group',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'id-1',
          name: 'alpha-group',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      groups.forEach(group => mockRepository.addGroup(group));

      const result = await groupService.getAllGroups();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('alpha-group');
      expect(result[1].name).toBe('zebra-group');
    });
  });

  describe('updateGroup', () => {
    let existingGroup: Group;

    beforeEach(() => {
      existingGroup = {
        id: 'test-id',
        name: 'original-name',
        description: 'Original description',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRepository.addGroup(existingGroup);
    });

    it('should update group name', async () => {
      const updates: UpdateGroupDto = {
        name: 'updated-name',
      };

      const result = await groupService.updateGroup('test-id', updates);

      expect(result.name).toBe('updated-name');
      expect(result.description).toBe('Original description');
    });

    it('should update group description', async () => {
      const updates: UpdateGroupDto = {
        description: 'Updated description',
      };

      const result = await groupService.updateGroup('test-id', updates);

      expect(result.name).toBe('original-name');
      expect(result.description).toBe('Updated description');
    });

    it('should update both name and description', async () => {
      const updates: UpdateGroupDto = {
        name: 'updated-name',
        description: 'Updated description',
      };

      const result = await groupService.updateGroup('test-id', updates);

      expect(result.name).toBe('updated-name');
      expect(result.description).toBe('Updated description');
    });

    it('should throw NotFoundError for non-existent group', async () => {
      const updates: UpdateGroupDto = {
        name: 'updated-name',
      };

      await expect(groupService.updateGroup('non-existent', updates)).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError for empty ID', async () => {
      const updates: UpdateGroupDto = {
        name: 'updated-name',
      };

      await expect(groupService.updateGroup('', updates)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid name', async () => {
      const updates = {
        name: 'invalid name!', // Contains space and special character
      };

      await expect(groupService.updateGroup('test-id', updates)).rejects.toThrow(ValidationError);
    });

    it('should throw ConflictError for duplicate name', async () => {
      const anotherGroup: Group = {
        id: 'another-id',
        name: 'another-group',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRepository.addGroup(anotherGroup);

      const updates: UpdateGroupDto = {
        name: 'another-group',
      };

      await expect(groupService.updateGroup('test-id', updates)).rejects.toThrow(ConflictError);
    });
  });

  describe('deleteGroup', () => {
    let existingGroup: Group;

    beforeEach(() => {
      existingGroup = {
        id: 'test-id',
        name: 'test-group',
        description: 'Test description',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRepository.addGroup(existingGroup);
    });

    it('should delete existing group', async () => {
      await expect(groupService.deleteGroup('test-id')).resolves.not.toThrow();

      // Verify group is deleted
      await expect(groupService.getGroup('test-id')).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError for non-existent group', async () => {
      await expect(groupService.deleteGroup('non-existent')).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError for empty ID', async () => {
      await expect(groupService.deleteGroup('')).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for non-string ID', async () => {
      await expect(groupService.deleteGroup(null as any)).rejects.toThrow(ValidationError);
    });
  });

  describe('validateGroupData', () => {
    it('should return valid for correct data', () => {
      const data = {
        name: 'test-group',
        description: 'Test description',
      };

      const result = groupService.validateGroupData(data);

      expect(result.isValid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should return invalid for missing name', () => {
      const data = {
        description: 'Test description',
      };

      const result = groupService.validateGroupData(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors![0]).toContain('name');
    });

    it('should return invalid for empty name', () => {
      const data = {
        name: '',
        description: 'Test description',
      };

      const result = groupService.validateGroupData(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should return invalid for name with invalid characters', () => {
      const data = {
        name: 'test group!',
        description: 'Test description',
      };

      const result = groupService.validateGroupData(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should return valid for data without description', () => {
      const data = {
        name: 'test-group',
      };

      const result = groupService.validateGroupData(data);

      expect(result.isValid).toBe(true);
    });
  });
});