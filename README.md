# Infrastructure Source of Truth (ISoT)

A centralized Infrastructure Source of Truth system for managing and tracking network infrastructure information, specifically designed for Infrastructure as Code (IaaC) environments.

## Overview

The Network Source of Truth provides a comprehensive API-first solution for managing network resources, services, and their relationships. This system serves as the single source of truth for network infrastructure data, enabling teams to maintain accurate, up-to-date information about their network topology, services, and configurations.
~~~~
## Features

### Core Functionality
- **Service Management**: Track network services with detailed metadata including ports, VLANs, IP addresses, and domains
- **Group Organization**: Organize services into logical groups (storage, security, data_services, etc.)
- **Comprehensive Metadata**: Store internal/external ports, VLAN information, CIDR blocks, IP addresses, and custom tags
- **RESTful API**: Full CRUD operations with filtering and search capabilities
- **Data Validation**: Robust input validation for network-specific data (IP addresses, CIDR notation, port ranges)

### Technical Features
- **Next.js API**: Modern, performant API built with Next.js 15
- **SQLite Database**: Lightweight, file-based database perfect for development and small-to-medium deployments
- **TypeScript**: Full type safety throughout the application
- **Microservice Architecture**: Organized folder structure supporting microservice patterns
- **Comprehensive Testing**: Unit and integration tests for all components

## Architecture

The system follows a layered architecture pattern:

```
api/
├── models/           # Data models and TypeScript interfaces
├── services/         # Business logic layer
├── repositories/     # Data access layer
├── controllers/      # API endpoint handlers
├── middleware/       # Request processing middleware
├── utils/           # Utility functions and helpers
└── database/        # Database configuration and migrations
```

## Data Model

### Groups
Logical organization units for network services:
- `storage` - Storage and data persistence services
- `security` - Security and authentication services  
- `data_services` - Data processing and analytics services
- Custom groups as needed

### Network Services
Core network service entities with the following attributes:
- **Basic Info**: ID, name, domain, group assignment
- **Network Config**: Internal ports, external ports, VLAN, CIDR, IP address
- **Metadata**: Tags, creation/update timestamps
- **Relationships**: Belongs to a group, supports filtering and querying

## API Endpoints

### Groups Management
- `GET /api/groups` - List all groups
- `GET /api/groups/[id]` - Get specific group
- `POST /api/groups` - Create new group
- `PUT /api/groups/[id]` - Update group
- `DELETE /api/groups/[id]` - Delete group

### Network Services Management
- `GET /api/services` - List services with optional filtering
- `GET /api/services/[id]` - Get specific service
- `GET /api/groups/[id]/services` - Get services by group
- `POST /api/services` - Create new service
- `PUT /api/services/[id]` - Update service
- `DELETE /api/services/[id]` - Delete service

### Filtering Support
Services can be filtered by:
- Group ID
- VLAN
- Tags (array matching)
- IP address
- CIDR range
- Domain patterns

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd network-source-truth

# Install dependencies
npm install

# Initialize the database
npm run db:init

# Start development server
npm run dev
```

### Development Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run test suite
npm run test:watch   # Run tests in watch mode
npm run db:init      # Initialize database with schema
npm run db:seed      # Seed database with default data
```

## Project Structure

```
├── api/                    # API implementation
│   ├── controllers/        # Request handlers
│   ├── database/          # Database config and migrations
│   ├── middleware/        # Express middleware
│   ├── models/           # Data models and interfaces
│   ├── repositories/     # Data access layer
│   ├── services/         # Business logic
│   └── utils/           # Utility functions
├── tests/                 # Test files
└── docs/                 # Documentation

```

## Development Approach

This project follows a spec-driven development methodology:

1. **Requirements**: Detailed user stories and acceptance criteria
2. **Design**: Comprehensive architecture and technical design
3. **Implementation**: Step-by-step coding tasks with clear objectives

All specifications are maintained in the `.kiro/specs/network-source-truth/` directory.

## Use Cases

### Infrastructure Teams
- Maintain accurate inventory of network services
- Track service dependencies and relationships
- Plan network changes and capacity
- Document network topology and configurations

### DevOps Teams
- Integrate with Infrastructure as Code tools
- Automate service discovery and registration
- Support deployment pipelines with network data
- Enable self-service infrastructure provisioning

### Security Teams
- Audit network service configurations
- Track security group assignments
- Monitor network access patterns
- Maintain compliance documentation

## Future Enhancements

- **Frontend Interface**: React-based web UI for visual management
- **Authentication**: User authentication and authorization
- **Advanced Filtering**: Complex query capabilities
- **Integration APIs**: Webhooks and event streaming
- **Monitoring**: Health checks and metrics collection
- **Import/Export**: Bulk data operations and migrations

## Contributing

1. Review the specifications in `.kiro/specs/network-source-truth/`
2. Follow the implementation tasks outlined in `tasks.md`
3. Ensure all tests pass before submitting changes
4. Update documentation as needed

## License

[License information]

---

**Status**: In Development  
**Phase**: API Implementation  
**Next**: Task execution from implementation plan