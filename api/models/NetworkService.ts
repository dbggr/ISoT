/**
 * NetworkService model interface and types
 * Represents network services with their configuration and metadata
 */

import type { Group } from './Group';

export interface NetworkService {
  id: string;
  groupId: string;
  name: string;
  type: 'web' | 'database' | 'api' | 'storage' | 'security' | 'monitoring';
  domain: string;
  internalPorts: number[];
  externalPorts: number[];
  vlan: string;
  cidr: string;
  ipAddress: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  group?: Group; // Optional populated group data
}

export interface CreateNetworkServiceDto {
  groupId: string;
  name: string;
  type: NetworkService['type'];
  domain: string;
  internalPorts: number[];
  externalPorts: number[];
  vlan?: string;
  cidr?: string;
  ipAddress?: string;
  tags?: string[];
}

export interface UpdateNetworkServiceDto {
  groupId?: string;
  name?: string;
  type?: NetworkService['type'];
  domain?: string;
  internalPorts?: number[];
  externalPorts?: number[];
  vlan?: string;
  cidr?: string;
  ipAddress?: string;
  tags?: string[];
}

export interface ServiceFilters {
  groupId?: string;
  vlan?: string;
  tags?: string[];
  ipAddress?: string;
  cidrRange?: string;
  domain?: string;
}

export interface NetworkServiceWithGroup extends NetworkService {
  group: Group;
}