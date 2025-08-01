// Core data types for the Network Source of Truth application

export interface NetworkService {
  id: string
  name: string
  type: 'web' | 'database' | 'api' | 'storage' | 'security' | 'monitoring'
  ipAddress: string
  internalPorts: number[]
  externalPorts: number[]
  vlan?: string
  cidr?: string
  domain?: string
  groupId: string
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export interface Group {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  services?: NetworkService[]
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Error Handling Types
export interface ApiError {
  message: string
  status: number
  code?: string
  details?: Record<string, any>
}

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ApiErrorResponse {
  error: string
  message: string
  status: number
  details?: ValidationError[]
}

// Request/Response Types
export interface CreateServiceData {
  name: string
  type: NetworkService['type']
  ipAddress: string
  internalPorts: number[]
  externalPorts: number[]
  vlan?: string
  cidr?: string
  domain?: string
  groupId: string
  tags?: string[]
}

export interface UpdateServiceData extends Partial<CreateServiceData> {}

export interface CreateGroupData {
  name: string
  description?: string
}

export interface UpdateGroupData extends Partial<CreateGroupData> {}

// Query Parameters
export interface QueryParams {
  page?: number
  limit?: number
  search?: string
  sort?: string
  order?: 'asc' | 'desc'
  group_id?: string
  type?: NetworkService['type']
}

export interface ServiceFilters {
  groupId?: string
  vlan?: number
  tags?: string[]
  ipAddress?: string
  cidrRange?: string
  domain?: string
}

// HTTP Method Types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

// API Client Configuration
export interface ApiClientConfig {
  baseUrl?: string
  timeout?: number
  retries?: number
  retryDelay?: number
}