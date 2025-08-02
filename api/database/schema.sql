-- Network Source of Truth Database Schema

-- Groups table for organizing network services
CREATE TABLE IF NOT EXISTS groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Network services table for storing service information
CREATE TABLE IF NOT EXISTS network_services (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'web', -- Service type: web, database, api, storage, security, monitoring
  domain TEXT NOT NULL,
  internal_ports TEXT, -- JSON array of port numbers
  external_ports TEXT, -- JSON array of port numbers
  vlan TEXT,
  cidr TEXT,
  ip_address TEXT,
  tags TEXT, -- JSON array of tags
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_network_services_group_id ON network_services(group_id);
CREATE INDEX IF NOT EXISTS idx_network_services_vlan ON network_services(vlan);
CREATE INDEX IF NOT EXISTS idx_network_services_ip_address ON network_services(ip_address);
CREATE INDEX IF NOT EXISTS idx_groups_name ON groups(name);

-- Trigger to update updated_at timestamp for groups
CREATE TRIGGER IF NOT EXISTS update_groups_updated_at
  AFTER UPDATE ON groups
  FOR EACH ROW
BEGIN
  UPDATE groups SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger to update updated_at timestamp for network_services
CREATE TRIGGER IF NOT EXISTS update_network_services_updated_at
  AFTER UPDATE ON network_services
  FOR EACH ROW
BEGIN
  UPDATE network_services SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;