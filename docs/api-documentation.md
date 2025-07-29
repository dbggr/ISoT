# Network Source of Truth API Documentation

## Overview

The Network Source of Truth API provides a RESTful interface for managing network infrastructure information. This API allows you to manage groups and network services with comprehensive filtering and validation capabilities.

**Base URL**: `http://localhost:3000/api`

**Content Type**: `application/json`

## Authentication

Currently, the API does not require authentication. This may be added in future versions.

## Error Responses

All endpoints return standardized error responses in the following format:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": "Additional error details (optional)",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Common HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., duplicate name)
- `500 Internal Server Error` - Server error

## Groups API

Groups are logical containers for organizing network services.

### List All Groups

**GET** `/api/groups`

Returns a list of all groups.

**Response:**
```json
[
  {
    "id": "a9b25ab4-7651-4888-8626-a31405773103",
    "name": "Storage",
    "description": "Storage and data persistence services",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Get Group by ID

**GET** `/api/groups/{id}`

Returns a specific group by ID.

**Parameters:**
- `id` (path) - Group UUID

**Response:**
```json
{
  "id": "a9b25ab4-7651-4888-8626-a31405773103",
  "name": "Storage",
  "description": "Storage and data persistence services",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Create Group

**POST** `/api/groups`

Creates a new group.

**Request Body:**
```json
{
  "name": "New Group",
  "description": "Optional description"
}
```

**Response:** `201 Created`
```json
{
  "id": "b8c3d4e5-f6a7-4b89-9c0d-1e2f3a4b5c6d",
  "name": "New Group",
  "description": "Optional description",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Update Group

**PUT** `/api/groups/{id}`

Updates an existing group.

**Parameters:**
- `id` (path) - Group UUID

**Request Body:**
```json
{
  "name": "Updated Group Name",
  "description": "Updated description"
}
```

**Response:**
```json
{
  "id": "a9b25ab4-7651-4888-8626-a31405773103",
  "name": "Updated Group Name",
  "description": "Updated description",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Delete Group

**DELETE** `/api/groups/{id}`

Deletes a group and all associated network services.

**Parameters:**
- `id` (path) - Group ID

**Response:** `200 OK`
```json
{
  "message": "Group deleted successfully"
}
```

## Network Services API

Network services represent individual network resources with associated metadata.

### List All Services

**GET** `/api/services`

Returns a list of all network services with optional filtering.

**Query Parameters:**
- `groupId` (optional) - Filter by group ID
- `vlan` (optional) - Filter by VLAN
- `tags` (optional) - Filter by tags (comma-separated)
- `ipAddress` (optional) - Filter by IP address
- `cidrRange` (optional) - Filter by CIDR range
- `domain` (optional) - Filter by domain

**Example:** `/api/services?groupId=a9b25ab4-7651-4888-8626-a31405773103&vlan=100&tags=production,database`

**Response:**
```json
[
  {
    "id": "4fddedd4-7d30-4cc8-9fb3-072a4ffca857",
    "groupId": "a9b25ab4-7651-4888-8626-a31405773103",
    "name": "Database Server",
    "domain": "db.example.com",
    "internalPorts": [5432],
    "externalPorts": [5432],
    "vlan": "100",
    "cidr": "10.0.1.0/24",
    "ipAddress": "10.0.1.10",
    "tags": ["production", "database"],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "group": {
      "id": "a9b25ab4-7651-4888-8626-a31405773103",
      "name": "Storage",
      "description": "Storage and data persistence services"
    }
  }
]
```

### Get Service by ID

**GET** `/api/services/{id}`

Returns a specific network service by ID.

**Parameters:**
- `id` (path) - Service UUID

**Response:**
```json
{
  "id": "4fddedd4-7d30-4cc8-9fb3-072a4ffca857",
  "groupId": "a9b25ab4-7651-4888-8626-a31405773103",
  "name": "Database Server",
  "domain": "db.example.com",
  "internalPorts": [5432],
  "externalPorts": [5432],
  "vlan": "100",
  "cidr": "10.0.1.0/24",
  "ipAddress": "10.0.1.10",
  "tags": ["production", "database"],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "group": {
    "id": "a9b25ab4-7651-4888-8626-a31405773103",
    "name": "Storage",
    "description": "Storage and data persistence services"
  }
}
```

### Get Services by Group

**GET** `/api/groups/{id}/services`

Returns all network services for a specific group.

**Parameters:**
- `id` (path) - Group UUID

**Response:**
```json
[
  {
    "id": "4fddedd4-7d30-4cc8-9fb3-072a4ffca857",
    "groupId": "a9b25ab4-7651-4888-8626-a31405773103",
    "name": "Database Server",
    "domain": "db.example.com",
    "internalPorts": [5432],
    "externalPorts": [5432],
    "vlan": "100",
    "cidr": "10.0.1.0/24",
    "ipAddress": "10.0.1.10",
    "tags": ["production", "database"],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Create Service

**POST** `/api/services`

Creates a new network service.

**Request Body:**
```json
{
  "groupId": "a9b25ab4-7651-4888-8626-a31405773103",
  "name": "Database Server",
  "domain": "db.example.com",
  "internalPorts": [5432],
  "externalPorts": [5432],
  "vlan": "100",
  "cidr": "10.0.1.0/24",
  "ipAddress": "10.0.1.10",
  "tags": ["production", "database"]
}
```

**Response:** `201 Created`
```json
{
  "id": "4fddedd4-7d30-4cc8-9fb3-072a4ffca857",
  "groupId": "a9b25ab4-7651-4888-8626-a31405773103",
  "name": "Database Server",
  "domain": "db.example.com",
  "internalPorts": [5432],
  "externalPorts": [5432],
  "vlan": "100",
  "cidr": "10.0.1.0/24",
  "ipAddress": "10.0.1.10",
  "tags": ["production", "database"],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Update Service

**PUT** `/api/services/{id}`

Updates an existing network service.

**Parameters:**
- `id` (path) - Service UUID

**Request Body:**
```json
{
  "name": "Updated Database Server",
  "domain": "db-updated.example.com",
  "internalPorts": [5432, 5433],
  "externalPorts": [5432],
  "vlan": "101",
  "cidr": "10.0.2.0/24",
  "ipAddress": "10.0.2.10",
  "tags": ["production", "database", "updated"]
}
```

**Response:**
```json
{
  "id": "4fddedd4-7d30-4cc8-9fb3-072a4ffca857",
  "groupId": "a9b25ab4-7651-4888-8626-a31405773103",
  "name": "Updated Database Server",
  "domain": "db-updated.example.com",
  "internalPorts": [5432, 5433],
  "externalPorts": [5432],
  "vlan": "101",
  "cidr": "10.0.2.0/24",
  "ipAddress": "10.0.2.10",
  "tags": ["production", "database", "updated"],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Delete Service

**DELETE** `/api/services/{id}`

Deletes a network service.

**Parameters:**
- `id` (path) - Service ID

**Response:** `200 OK`
```json
{
  "message": "Service deleted successfully"
}
```

## Health Check API

### Health Check

**GET** `/api/health`

Returns the health status of the API and database connection.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "0.1.0",
  "database": {
    "status": "connected",
    "tables": ["groups", "network_services"]
  }
}
```

## Data Validation

### Group Validation

- `name`: Required, 1-100 characters, must be unique
- `description`: Optional string

### Network Service Validation

- `groupId`: Required, must reference existing group
- `name`: Required, 1-255 characters
- `domain`: Required, valid domain format
- `internalPorts`: Array of integers (1-65535)
- `externalPorts`: Array of integers (1-65535)
- `vlan`: Optional string
- `cidr`: Optional, valid CIDR notation (e.g., "10.0.1.0/24")
- `ipAddress`: Optional, valid IP address format
- `tags`: Array of strings

## Examples

### Create a complete network service

```bash
curl -X POST http://localhost:3000/api/services \
  -H "Content-Type: application/json" \
  -d '{
    "groupId": "a9b25ab4-7651-4888-8626-a31405773103",
    "name": "PostgreSQL Database",
    "domain": "postgres.internal.com",
    "internalPorts": [5432],
    "externalPorts": [5432],
    "vlan": "100",
    "cidr": "10.0.1.0/24",
    "ipAddress": "10.0.1.15",
    "tags": ["database", "production", "postgresql"]
  }'
```

### Filter services by multiple criteria

```bash
curl "http://localhost:3000/api/services?groupId=a9b25ab4-7651-4888-8626-a31405773103&vlan=100&tags=production,database"
```

### Check API health

```bash
curl http://localhost:3000/api/health
```