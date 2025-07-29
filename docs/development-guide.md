# Development Guide

## Quick Start

### Initial Setup
```bash
# Clone and setup the project
npm run setup
```

This command will:
1. Install all dependencies
2. Initialize the SQLite database with schema
3. Seed the database with default groups

### Development Server
```bash
# Start the development server
npm run dev
```

The API will be available at `http://localhost:3000/api`

## Available Scripts

### Development
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

### Testing
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:unit` - Run only unit tests
- `npm run test:integration` - Run only integration tests
- `npm run test:coverage` - Run tests with coverage report

### Database Management
- `npm run db:init` - Initialize database schema
- `npm run db:seed` - Seed database with default data
- `npm run db:reset` - Reset database (delete and recreate)
- `npm run db:reset-test` - Reset test database
- `npm run db:test` - Test database connection

### API Testing
- `npm run api:test` - Quick health check of running API
- `npm run api:docs` - Show API documentation location

### Utility Scripts
- `npm run setup` - Complete project setup (install + db init + seed)
- `npm run clean` - Clean build artifacts and reset database
- `npm run verify` - Run full verification (lint + test + build)

## Development Workflow

### 1. Starting Development
```bash
# First time setup
npm run setup

# Start development server
npm run dev
```

### 2. Making Changes
```bash
# Run tests while developing
npm run test:watch

# Check code quality
npm run lint
```

### 3. Testing API Endpoints
```bash
# Check if API is running
npm run api:test

# Test specific endpoints
curl http://localhost:3000/api/groups
curl http://localhost:3000/api/services
```

### 4. Database Operations
```bash
# Reset database if needed
npm run db:reset

# Check database status
npm run db:test
```

### 5. Before Committing
```bash
# Run full verification
npm run verify
```

## API Testing Examples

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Groups API
```bash
# List all groups
curl http://localhost:3000/api/groups

# Get specific group
curl http://localhost:3000/api/groups/storage

# Create new group
curl -X POST http://localhost:3000/api/groups \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Group", "description": "Test description"}'
```

### Services API
```bash
# List all services
curl http://localhost:3000/api/services

# Filter services
curl "http://localhost:3000/api/services?groupId=storage&vlan=100"

# Create new service
curl -X POST http://localhost:3000/api/services \
  -H "Content-Type: application/json" \
  -d '{
    "groupId": "storage",
    "name": "Test Service",
    "domain": "test.example.com",
    "internalPorts": [8080],
    "externalPorts": [80],
    "vlan": "100",
    "cidr": "10.0.1.0/24",
    "ipAddress": "10.0.1.10",
    "tags": ["test"]
  }'
```

## Troubleshooting

### Database Issues
```bash
# If database is corrupted or has issues
npm run db:reset

# If test database has issues
npm run db:reset-test
```

### API Not Responding
```bash
# Check if server is running
npm run api:test

# Restart development server
npm run dev
```

### Test Failures
```bash
# Run tests with verbose output
npm test -- --verbose

# Run specific test file
npm test -- tests/integration/groups-api.test.ts
```

### Build Issues
```bash
# Clean and rebuild
npm run clean
npm run setup
npm run build
```

## Environment Variables

Create a `.env.local` file for local development:

```env
# Database configuration
DATABASE_PATH=./data/network-source-truth.db
TEST_DATABASE_PATH=./data/network-source-truth-test.db

# API configuration
NODE_ENV=development
PORT=3000

# CORS configuration
CORS_ORIGIN=*
```

## File Structure

```
├── api/                    # API implementation
│   ├── controllers/        # API endpoint handlers
│   ├── services/          # Business logic
│   ├── repositories/      # Data access layer
│   ├── models/           # Data models
│   ├── middleware/       # Request middleware
│   ├── utils/            # Utility functions
│   └── database/         # Database configuration
├── app/api/              # Next.js API routes
├── tests/                # Test files
│   ├── unit/            # Unit tests
│   ├── integration/     # Integration tests
│   └── fixtures/        # Test data and utilities
├── docs/                 # Documentation
├── scripts/              # Database scripts
└── data/                 # SQLite database files
```

## Best Practices

### Code Quality
- Run `npm run lint` before committing
- Write tests for new features
- Follow TypeScript strict mode
- Use proper error handling

### Database
- Always use migrations for schema changes
- Test database operations with unit tests
- Use transactions for complex operations
- Keep test database separate from development

### API Development
- Follow RESTful conventions
- Validate all inputs
- Return appropriate HTTP status codes
- Include proper error messages
- Test all endpoints with integration tests

### Testing
- Write unit tests for business logic
- Write integration tests for API endpoints
- Use test fixtures for consistent data
- Run tests before committing changes