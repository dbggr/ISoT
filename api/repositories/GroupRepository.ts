/**
 * Group repository interface and implementation
 * Defines data access operations for Group entities
 */

import { randomUUID } from 'crypto';
import type { Group, CreateGroupDto, UpdateGroupDto } from '../models/Group';
import { getDatabase } from '../database/connection';
import { DatabaseError, NotFoundError, ConflictError, handleDatabaseError } from '../utils/errors';

export interface GroupRepository {
  create(group: CreateGroupDto): Promise<Group>;
  findById(id: string): Promise<Group | null>;
  findAll(): Promise<Group[]>;
  update(id: string, updates: UpdateGroupDto): Promise<Group>;
  delete(id: string): Promise<boolean>;
  findByName(name: string): Promise<Group | null>;
}

interface GroupRow {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export class SQLiteGroupRepository implements GroupRepository {
  private db = getDatabase();

  private mapRowToGroup(row: GroupRow): Group {
    return {
      id: row.id,
      name: row.name,
      description: row.description || undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async create(group: CreateGroupDto): Promise<Group> {
    const id = randomUUID();
    const now = new Date().toISOString();

    try {
      const stmt = this.db.prepare(`
        INSERT INTO groups (id, name, description, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
      `);

      stmt.run(id, group.name, group.description || null, now, now);

      const createdGroup = await this.findById(id);
      if (!createdGroup) {
        throw new DatabaseError('Failed to create group');
      }

      return createdGroup;
    } catch (error) {
      if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
        throw new ConflictError(`Group with name '${group.name}' already exists`);
      }
      throw handleDatabaseError(error as Error);
    }
  }

  async findById(id: string): Promise<Group | null> {
    try {
      const stmt = this.db.prepare(`
        SELECT id, name, description, created_at, updated_at
        FROM groups
        WHERE id = ?
      `);

      const row = stmt.get(id) as GroupRow | undefined;
      return row ? this.mapRowToGroup(row) : null;
    } catch (error) {
      throw handleDatabaseError(error as Error);
    }
  }

  async findAll(): Promise<Group[]> {
    try {
      const stmt = this.db.prepare(`
        SELECT id, name, description, created_at, updated_at
        FROM groups
        ORDER BY name ASC
      `);

      const rows = stmt.all() as GroupRow[];
      return rows.map(row => this.mapRowToGroup(row));
    } catch (error) {
      throw handleDatabaseError(error as Error);
    }
  }

  async update(id: string, updates: UpdateGroupDto): Promise<Group> {
    // First check if the group exists
    const existingGroup = await this.findById(id);
    if (!existingGroup) {
      throw new NotFoundError('Group', id);
    }

    // Build dynamic update query
    const updateFields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      updateFields.push('name = ?');
      values.push(updates.name);
    }

    if (updates.description !== undefined) {
      updateFields.push('description = ?');
      values.push(updates.description);
    }

    if (updateFields.length === 0) {
      // No updates provided, return existing group
      return existingGroup;
    }

    updateFields.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    try {
      const stmt = this.db.prepare(`
        UPDATE groups
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `);

      const result = stmt.run(...values);
      
      if (result.changes === 0) {
        throw new NotFoundError('Group', id);
      }

      const updatedGroup = await this.findById(id);
      if (!updatedGroup) {
        throw new DatabaseError('Failed to retrieve updated group');
      }

      return updatedGroup;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
        throw new ConflictError(`Group with name '${updates.name}' already exists`);
      }
      throw handleDatabaseError(error as Error);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const stmt = this.db.prepare(`
        DELETE FROM groups
        WHERE id = ?
      `);

      const result = stmt.run(id);
      return result.changes > 0;
    } catch (error) {
      if (error instanceof Error && error.message.includes('FOREIGN KEY constraint failed')) {
        throw new ConflictError('Cannot delete group that has associated network services');
      }
      throw handleDatabaseError(error as Error);
    }
  }

  async findByName(name: string): Promise<Group | null> {
    try {
      const stmt = this.db.prepare(`
        SELECT id, name, description, created_at, updated_at
        FROM groups
        WHERE name = ?
      `);

      const row = stmt.get(name) as GroupRow | undefined;
      return row ? this.mapRowToGroup(row) : null;
    } catch (error) {
      throw handleDatabaseError(error as Error);
    }
  }
}