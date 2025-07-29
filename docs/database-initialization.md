# Database Initialization and Seeding

This document describes the database initialization and seeding functionality implemented for the Network Source of Truth API.

## Overview

The system automatically initializes the database schema and seeds default data when the application starts. This ensures that the database is always ready for use without manual intervention.

## Features

### Automatic Initialization
- Database schema is created automatically on first run
- Default groups are seeded during initialization
- Initialization is idempotent (safe to run multiple times)
- Runs automatically when API endpoints are accessed

### Environment-Based Configuration
- Database file location can be configured via `DATABASE_PATH` environment variable
- Supports different database files for different environments
- Falls back to sensible defaults if not configured

### Default Groups
The system seeds three default groups:
- **Storage**: Storage and data persistence services
- **Security**: Security and authentication services  
- **Data Services**: Data processing and analytics services

## Environment Configuration

### Environment Variables
- `DATABASE_PATH`: Path to the SQLite database file (optional)
- `NODE_ENV`: Environment mode (development, test, production)

### Default Database Paths
- **Development**: `./data/network-source-truth.db`
- **Test**: `./data/network-source-truth-test.db`
- **Production**: `./data/network-source-truth.db`

## Usage

### Automatic Initialization
The database is automatically initialized when:
- Any API endpoint is accessed for the first time
- The application starts and processes requests

### Manual Scripts
Available npm scripts for database management:

```bash
# Initialize database with schema and default data
npm run db:init

# Seed database with default data (also initializes if needed)
npm run db:seed

# Test database connection and verify setup
npm run db:test

# Test automatic startup initialization
npm run db:test-startup
```

### Custom Database Path
You can specify a custom database path using environment variables:

```bash
# Use custom database file
DATABASE_PATH=./data/custom.db npm run db:init

# Use custom path for development
DATABASE_PATH=/path/to/database.db npm run dev
```

## Implementation Details

### Database Manager
The `DatabaseManager` class handles:
- Schema creation from SQL files
- Migration management
- Default data seeding
- Database reset functionality

### Startup Integration
- The `withErrorHandler` middleware ensures database initialization before processing requests
- The `ensureDatabaseInitialized` function provides idempotent initialization
- Initialization state is tracked to prevent duplicate operations

### Migration System
- Supports SQL migration files in `api/database/migrations/`
- Tracks applied migrations in a `migrations` table
- Migrations are applied automatically during initialization

## File Structure

```
api/database/
├── connection.ts          # Database connection management
├── index.ts              # DatabaseManager class
├── init.ts               # Startup initialization utilities
├── schema.sql            # Main database schema
├── startup.ts            # Application startup hooks
└── migrations/           # Database migration files
    └── 001_initial_schema.sql
```

## Error Handling

The system includes comprehensive error handling for:
- Database connection failures
- Schema creation errors
- Migration application failures
- Seeding operation errors

All errors are logged with detailed messages and proper error propagation.

## Testing

The system includes tests for:
- Automatic initialization functionality
- Environment-based configuration
- Idempotent operation behavior
- Default data seeding
- Integration with API endpoints

Run tests with:
```bash
npm test
npm run db:test-startup
```