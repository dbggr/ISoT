/**
 * NetworkService repository interface and implementation
 * Defines data access operations for NetworkService entities
 */

import { randomUUID } from 'crypto';
import type { 
  NetworkService, 
  CreateNetworkServiceDto, 
  UpdateNetworkServiceDto, 
  ServiceFilters 
} from '../models/NetworkService';
import { getDatabase } from '../database/connection';
import { DatabaseError, NotFoundError, ConflictError, ValidationError, handleDatabaseError } from '../utils/errors';

export interface NetworkServiceRepository {
  create(service: CreateNetworkServiceDto): Promise<NetworkService>;
  findById(id: string): Promise<NetworkService | null>;
  findAll(filters?: ServiceFilters): Promise<NetworkService[]>;
  update(id: string, updates: UpdateNetworkServiceDto): Promise<NetworkService>;
  delete(id: string): Promise<boolean>;
  findByGroupId(groupId: string): Promise<NetworkService[]>;
}

interface NetworkServiceRow {
  id: string;
  group_id: string;
  name: string;
  type: string;
  domain: string;
  internal_ports: string;
  external_ports: string;
  vlan: string | null;
  cidr: string | null;
  ip_address: string | null;
  tags: string;
  created_at: string;
  updated_at: string;
}

export class SQLiteNetworkServiceRepository implements NetworkServiceRepository {
  private _db: ReturnType<typeof getDatabase> | null = null;

  private get db() {
    if (!this._db) {
      this._db = getDatabase();
    }
    return this._db;
  }

  private mapRowToNetworkService(row: NetworkServiceRow): NetworkService {
    return {
      id: row.id,
      groupId: row.group_id,
      name: row.name,
      type: row.type as NetworkService['type'],
      domain: row.domain,
      internalPorts: this.deserializeArray(row.internal_ports),
      externalPorts: this.deserializeArray(row.external_ports),
      vlan: row.vlan || '',
      cidr: row.cidr || '',
      ipAddress: row.ip_address || '',
      tags: this.deserializeStringArray(row.tags),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private serializeArray(arr: number[]): string {
    return JSON.stringify(arr || []);
  }

  private deserializeArray(str: string): number[] {
    try {
      const parsed = JSON.parse(str || '[]');
      return Array.isArray(parsed) ? parsed.filter(item => typeof item === 'number') : [];
    } catch {
      return [];
    }
  }

  private serializeStringArray(arr: string[]): string {
    return JSON.stringify(arr || []);
  }

  private deserializeStringArray(str: string): string[] {
    try {
      const parsed = JSON.parse(str || '[]');
      return Array.isArray(parsed) ? parsed.filter(item => typeof item === 'string') : [];
    } catch {
      return [];
    }
  }

  async create(service: CreateNetworkServiceDto): Promise<NetworkService> {
    const id = randomUUID();
    const now = new Date().toISOString();

    // Validate that the group exists
    const groupCheck = this.db.prepare('SELECT id FROM groups WHERE id = ?');
    const groupExists = groupCheck.get(service.groupId);
    if (!groupExists) {
      throw new ValidationError(`Group with id '${service.groupId}' does not exist`);
    }

    try {
      const stmt = this.db.prepare(`
        INSERT INTO network_services (
          id, group_id, name, type, domain, internal_ports, external_ports,
          vlan, cidr, ip_address, tags, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING id, group_id, name, type, domain, internal_ports, external_ports,
                  vlan, cidr, ip_address, tags, created_at, updated_at
      `);

      const row = stmt.get(
        id,
        service.groupId,
        service.name,
        service.type,
        service.domain,
        this.serializeArray(service.internalPorts),
        this.serializeArray(service.externalPorts),
        service.vlan || null,
        service.cidr || null,
        service.ipAddress || null,
        this.serializeStringArray(service.tags || []),
        now,
        now
      ) as NetworkServiceRow | undefined;

      if (!row) {
        throw new DatabaseError('Failed to create network service');
      }

      return this.mapRowToNetworkService(row);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw handleDatabaseError(error as Error);
    }
  }

  async findById(id: string): Promise<NetworkService | null> {
    try {
      const stmt = this.db.prepare(`
        SELECT id, group_id, name, type, domain, internal_ports, external_ports,
               vlan, cidr, ip_address, tags, created_at, updated_at
        FROM network_services
        WHERE id = ?
      `);

      const row = stmt.get(id) as NetworkServiceRow | undefined;
      return row ? this.mapRowToNetworkService(row) : null;
    } catch (error) {
      throw handleDatabaseError(error as Error);
    }
  }

  async findAll(filters?: ServiceFilters): Promise<NetworkService[]> {
    try {
      let query = `
        SELECT id, group_id, name, type, domain, internal_ports, external_ports,
               vlan, cidr, ip_address, tags, created_at, updated_at
        FROM network_services
      `;
      
      const conditions: string[] = [];
      const params: any[] = [];

      if (filters) {
        if (filters.groupId) {
          conditions.push('group_id = ?');
          params.push(filters.groupId);
        }

        if (filters.vlan) {
          conditions.push('vlan = ?');
          params.push(filters.vlan);
        }

        if (filters.ipAddress) {
          conditions.push('ip_address = ?');
          params.push(filters.ipAddress);
        }

        if (filters.domain) {
          conditions.push('domain LIKE ?');
          params.push(`%${filters.domain}%`);
        }

        if (filters.cidrRange) {
          // CIDR range filtering using string matching - LIMITATIONS:
          // - This is a simplified implementation for basic pattern matching
          // - Does not perform proper IP address arithmetic or subnet calculations
          // - May produce false positives (e.g., "10.0.0" matches "110.0.0.1/24")
          // - For production use, consider implementing proper CIDR validation using
          //   libraries like 'ip-address' or 'netmask' for accurate subnet matching
          conditions.push('cidr LIKE ?');
          params.push(`%${filters.cidrRange}%`);
        }

        if (filters.tags && filters.tags.length > 0) {
          // For tags, we need to check if any of the provided tags exist in the JSON array
          // NOTE: This implementation uses parameterized queries to prevent SQL injection,
          // but tag values containing LIKE wildcards (% or _) may produce unexpected results.
          // For production use, consider implementing proper tag escaping or using JSON functions.
          const tagConditions = filters.tags.map(() => 'tags LIKE ?');
          conditions.push(`(${tagConditions.join(' OR ')})`);
          filters.tags.forEach(tag => {
            params.push(`%"${tag}"%`);
          });
        }
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }

      query += ' ORDER BY name ASC';

      const stmt = this.db.prepare(query);
      const rows = stmt.all(...params) as NetworkServiceRow[];
      return rows.map(row => this.mapRowToNetworkService(row));
    } catch (error) {
      throw handleDatabaseError(error as Error);
    }
  }

  async update(id: string, updates: UpdateNetworkServiceDto): Promise<NetworkService> {
    // First check if the service exists
    const existingService = await this.findById(id);
    if (!existingService) {
      throw new NotFoundError('NetworkService', id);
    }

    // If groupId is being updated, validate that the new group exists
    if (updates.groupId && updates.groupId !== existingService.groupId) {
      const groupCheck = this.db.prepare('SELECT id FROM groups WHERE id = ?');
      const groupExists = groupCheck.get(updates.groupId);
      if (!groupExists) {
        throw new ValidationError(`Group with id '${updates.groupId}' does not exist`);
      }
    }

    // Build dynamic update query
    const updateFields: string[] = [];
    const values: any[] = [];

    if (updates.groupId !== undefined) {
      updateFields.push('group_id = ?');
      values.push(updates.groupId);
    }

    if (updates.name !== undefined) {
      updateFields.push('name = ?');
      values.push(updates.name);
    }

    if (updates.domain !== undefined) {
      updateFields.push('domain = ?');
      values.push(updates.domain);
    }

    if (updates.internalPorts !== undefined) {
      updateFields.push('internal_ports = ?');
      values.push(this.serializeArray(updates.internalPorts));
    }

    if (updates.externalPorts !== undefined) {
      updateFields.push('external_ports = ?');
      values.push(this.serializeArray(updates.externalPorts));
    }

    if (updates.vlan !== undefined) {
      updateFields.push('vlan = ?');
      values.push(updates.vlan || null);
    }

    if (updates.cidr !== undefined) {
      updateFields.push('cidr = ?');
      values.push(updates.cidr || null);
    }

    if (updates.ipAddress !== undefined) {
      updateFields.push('ip_address = ?');
      values.push(updates.ipAddress || null);
    }

    if (updates.tags !== undefined) {
      updateFields.push('tags = ?');
      values.push(this.serializeStringArray(updates.tags));
    }

    if (updateFields.length === 0) {
      // No updates provided, return existing service
      return existingService;
    }

    updateFields.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    try {
      const stmt = this.db.prepare(`
        UPDATE network_services
        SET ${updateFields.join(', ')}
        WHERE id = ?
        RETURNING id, group_id, name, domain, internal_ports, external_ports,
                  vlan, cidr, ip_address, tags, created_at, updated_at
      `);

      const updatedRow = stmt.get(...values) as NetworkServiceRow | undefined;
      
      if (!updatedRow) {
        throw new NotFoundError('NetworkService', id);
      }

      return this.mapRowToNetworkService(updatedRow);
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw handleDatabaseError(error as Error);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const stmt = this.db.prepare(`
        DELETE FROM network_services
        WHERE id = ?
      `);

      const result = stmt.run(id);
      return result.changes > 0;
    } catch (error) {
      throw handleDatabaseError(error as Error);
    }
  }

  async findByGroupId(groupId: string): Promise<NetworkService[]> {
    try {
      const stmt = this.db.prepare(`
        SELECT id, group_id, name, domain, internal_ports, external_ports,
               vlan, cidr, ip_address, tags, created_at, updated_at
        FROM network_services
        WHERE group_id = ?
        ORDER BY name ASC
      `);

      const rows = stmt.all(groupId) as NetworkServiceRow[];
      return rows.map(row => this.mapRowToNetworkService(row));
    } catch (error) {
      throw handleDatabaseError(error as Error);
    }
  }
}