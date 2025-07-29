/**
 * Test data fixtures for integration tests
 */

export interface TestGroup {
  name: string;
  description?: string;
}

export interface TestNetworkService {
  groupId: string;
  name: string;
  domain: string;
  internalPorts: number[];
  externalPorts: number[];
  vlan?: string;
  cidr?: string;
  ipAddress?: string;
  tags?: string[];
}

export const testGroups: TestGroup[] = [
  {
    name: 'test-storage',
    description: 'Test storage services group'
  },
  {
    name: 'test-security',
    description: 'Test security services group'
  },
  {
    name: 'test-data-services',
    description: 'Test data processing services group'
  }
];

export const createTestNetworkService = (groupId: string, overrides: Partial<TestNetworkService> = {}): TestNetworkService => ({
  groupId,
  name: `test-service-${Date.now()}`,
  domain: 'test.example.com',
  internalPorts: [8080],
  externalPorts: [80],
  vlan: 'vlan-100',
  cidr: '192.168.1.0/24',
  ipAddress: '192.168.1.10',
  tags: ['test', 'api'],
  ...overrides
});

export const testNetworkServices = {
  webService: {
    name: 'web-service',
    domain: 'web.example.com',
    internalPorts: [8080, 8443],
    externalPorts: [80, 443],
    vlan: 'vlan-web',
    cidr: '192.168.1.0/24',
    ipAddress: '192.168.1.10',
    tags: ['web', 'frontend', 'public']
  },
  apiService: {
    name: 'api-service',
    domain: 'api.example.com',
    internalPorts: [3000],
    externalPorts: [443],
    vlan: 'vlan-api',
    cidr: '192.168.2.0/24',
    ipAddress: '192.168.2.10',
    tags: ['api', 'backend']
  },
  databaseService: {
    name: 'database-service',
    domain: 'db.internal.com',
    internalPorts: [5432],
    externalPorts: [5432],
    vlan: 'vlan-db',
    cidr: '10.0.1.0/24',
    ipAddress: '10.0.1.5',
    tags: ['database', 'internal', 'postgres']
  },
  cacheService: {
    name: 'cache-service',
    domain: 'cache.internal.com',
    internalPorts: [6379],
    externalPorts: [6379],
    vlan: 'vlan-cache',
    cidr: '10.0.2.0/24',
    ipAddress: '10.0.2.5',
    tags: ['cache', 'redis', 'internal']
  }
};

export const invalidTestData = {
  groups: {
    emptyName: { name: '', description: 'Invalid group' },
    missingName: { description: 'Missing name field' },
    longName: { name: 'a'.repeat(101), description: 'Name too long' }
  },
  services: {
    missingRequired: {
      name: 'incomplete-service'
      // Missing groupId, domain, internalPorts, externalPorts
    },
    invalidPorts: {
      groupId: 'test-group',
      name: 'invalid-ports',
      domain: 'test.com',
      internalPorts: [0, 65536], // Invalid port numbers
      externalPorts: [-1, 70000]
    },
    invalidIP: {
      groupId: 'test-group',
      name: 'invalid-ip',
      domain: 'test.com',
      internalPorts: [8080],
      externalPorts: [80],
      ipAddress: '999.999.999.999' // Invalid IP
    },
    invalidCIDR: {
      groupId: 'test-group',
      name: 'invalid-cidr',
      domain: 'test.com',
      internalPorts: [8080],
      externalPorts: [80],
      cidr: '192.168.1.0/33' // Invalid CIDR
    }
  }
};