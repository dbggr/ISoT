-- Initial schema migration
-- This migration is applied after the base schema.sql to demonstrate the migration system

-- This migration adds a comment to the database schema to indicate it is the initial migration

COMMENT ON DATABASE current_database() IS 'Initial migration applied to set up the migration system.';

-- Future schema changes should be added in subsequent migrations