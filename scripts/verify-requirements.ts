#!/usr/bin/env ts-node

/**
 * End-to-end verification script
 * Verifies all requirements are met through comprehensive testing
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  requirement?: string;
}

class RequirementsVerifier {
  private results: TestResult[] = [];
  private baseUrl = 'http://localhost:3000';

  /**
   * Run a shell command and return the result
   */
  private runCommand(command: string): { success: boolean; output: string } {
    try {
      const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
      return { success: true, output };
    } catch (error: any) {
      return { success: false, output: error.message };
    }
  }

  /**
   * Make HTTP request using curl
   */
  private async makeRequest(
    method: string,
    endpoint: string,
    data?: any,
    expectedStatus?: number
  ): Promise<{ success: boolean; status: number; data: any }> {
    const url = `${this.baseUrl}${endpoint}`;
    let curlCommand = `curl -s -w "\\n%{http_code}" -X ${method}`;
    
    if (data) {
      curlCommand += ` -H "Content-Type: application/json" -d '${JSON.stringify(data)}'`;
    }
    
    curlCommand += ` "${url}"`;

    const result = this.runCommand(curlCommand);
    
    if (!result.success) {
      return { success: false, status: 0, data: null };
    }

    const lines = result.output.trim().split('\n');
    const statusCode = parseInt(lines[lines.length - 1]);
    const responseBody = lines.slice(0, -1).join('\n');
    
    let parsedData;
    try {
      parsedData = responseBody ? JSON.parse(responseBody) : null;
    } catch {
      parsedData = responseBody;
    }

    const success = expectedStatus ? statusCode === expectedStatus : statusCode >= 200 && statusCode < 300;
    
    return {
      success,
      status: statusCode,
      data: parsedData
    };
  }

  /**
   * Add test result
   */
  private addResult(name: string, passed: boolean, message: string, requirement?: string) {
    this.results.push({ name, passed, message, requirement });
    const status = passed ? '✅' : '❌';
    const reqText = requirement ? ` (Req: ${requirement})` : '';
    console.log(`${status} ${name}${reqText}: ${message}`);
  }

  /**
   * Verify database setup and schema (Requirement 6.1, 6.2, 6.3)
   */
  private verifyDatabaseSetup() {
    console.log('\n🔍 Verifying Database Setup...');

    // Check if database file exists
    const dbPath = path.join(process.cwd(), 'data', 'network-source-truth.db');
    const dbExists = existsSync(dbPath);
    this.addResult(
      'Database file exists',
      dbExists,
      dbExists ? 'Database file found' : 'Database file not found',
      '6.1, 6.2'
    );

    // Test database connection
    const dbTest = this.runCommand('npm run db:test');
    this.addResult(
      'Database connection',
      dbTest.success,
      dbTest.success ? 'Database connection successful' : 'Database connection failed',
      '6.3'
    );
  }

  /**
   * Verify API health check (Requirement 2.6)
   */
  private async verifyHealthCheck() {
    console.log('\n🔍 Verifying Health Check...');

    const response = await this.makeRequest('GET', '/api/health', undefined, 200);
    this.addResult(
      'Health check endpoint',
      response.success,
      response.success ? 'Health check returns 200' : `Health check failed: ${response.status}`,
      '2.6'
    );

    if (response.success && response.data) {
      const hasRequiredFields = response.data.status && response.data.timestamp && response.data.database;
      this.addResult(
        'Health check response format',
        hasRequiredFields,
        hasRequiredFields ? 'Health check has required fields' : 'Health check missing required fields',
        '2.6'
      );
    }
  }

  /**
   * Verify Groups API endpoints (Requirements 2.1-2.6)
   */
  private async verifyGroupsAPI() {
    console.log('\n🔍 Verifying Groups API...');

    // Test GET /api/groups
    const listGroups = await this.makeRequest('GET', '/api/groups', undefined, 200);
    this.addResult(
      'GET /api/groups',
      listGroups.success,
      listGroups.success ? 'Groups list endpoint works' : `Failed: ${listGroups.status}`,
      '2.1'
    );

    // Get the first group ID for testing
    let firstGroupId: string | null = null;
    if (listGroups.success && listGroups.data && Array.isArray(listGroups.data) && listGroups.data.length > 0) {
      firstGroupId = listGroups.data[0].id;
    }

    // Test GET /api/groups/[id] with a real group ID
    if (firstGroupId) {
      const getGroup = await this.makeRequest('GET', `/api/groups/${firstGroupId}`, undefined, 200);
      this.addResult(
        'GET /api/groups/[id]',
        getGroup.success,
        getGroup.success ? 'Get group by ID works' : `Failed: ${getGroup.status}`,
        '2.2'
      );
    } else {
      this.addResult(
        'GET /api/groups/[id]',
        false,
        'No groups available to test individual group retrieval',
        '2.2'
      );
    }

    // Test POST /api/groups
    const createGroup = await this.makeRequest(
      'POST',
      '/api/groups',
      { name: 'Test Group', description: 'Test description' },
      201
    );
    this.addResult(
      'POST /api/groups',
      createGroup.success,
      createGroup.success ? 'Create group works' : `Failed: ${createGroup.status}`,
      '2.3'
    );

    let testGroupId: string | null = null;
    if (createGroup.success && createGroup.data) {
      testGroupId = createGroup.data.id;
    }

    // Test PUT /api/groups/[id]
    if (testGroupId) {
      const updateGroup = await this.makeRequest(
        'PUT',
        `/api/groups/${testGroupId}`,
        { name: 'Updated Test Group', description: 'Updated description' },
        200
      );
      this.addResult(
        'PUT /api/groups/[id]',
        updateGroup.success,
        updateGroup.success ? 'Update group works' : `Failed: ${updateGroup.status}`,
        '2.4'
      );

      // Test DELETE /api/groups/[id]
      const deleteGroup = await this.makeRequest('DELETE', `/api/groups/${testGroupId}`, undefined, 200);
      this.addResult(
        'DELETE /api/groups/[id]',
        deleteGroup.success,
        deleteGroup.success ? 'Delete group works' : `Failed: ${deleteGroup.status}`,
        '2.5'
      );
    }
  }

  /**
   * Verify Network Services API endpoints (Requirements 2.1-2.6, 3.1-3.4)
   */
  private async verifyServicesAPI() {
    console.log('\n🔍 Verifying Services API...');

    // Test GET /api/services
    const listServices = await this.makeRequest('GET', '/api/services', undefined, 200);
    this.addResult(
      'GET /api/services',
      listServices.success,
      listServices.success ? 'Services list endpoint works' : `Failed: ${listServices.status}`,
      '2.1'
    );

    // Get a group ID for testing services
    const groupsResponse = await this.makeRequest('GET', '/api/groups', undefined, 200);
    let testGroupId: string | null = null;
    if (groupsResponse.success && groupsResponse.data && Array.isArray(groupsResponse.data) && groupsResponse.data.length > 0) {
      testGroupId = groupsResponse.data[0].id;
    }

    // Test filtering (Requirement 3.1-3.4)
    if (testGroupId) {
      const filterByGroup = await this.makeRequest('GET', `/api/services?groupId=${testGroupId}`, undefined, 200);
      this.addResult(
        'Filter services by group',
        filterByGroup.success,
        filterByGroup.success ? 'Group filtering works' : `Failed: ${filterByGroup.status}`,
        '3.1'
      );
    } else {
      this.addResult(
        'Filter services by group',
        false,
        'No groups available to test service filtering',
        '3.1'
      );
    }

    // Test POST /api/services
    if (testGroupId) {
      const createService = await this.makeRequest(
        'POST',
        '/api/services',
        {
          groupId: testGroupId,
          name: 'Test Service',
          domain: 'test.example.com',
          internalPorts: [8080],
          externalPorts: [80],
          vlan: '100',
          cidr: '10.0.1.0/24',
          ipAddress: '10.0.1.10',
          tags: ['test']
        },
        201
      );
      this.addResult(
        'POST /api/services',
        createService.success,
        createService.success ? 'Create service works' : `Failed: ${createService.status}`,
        '2.3'
      );

      let testServiceId: string | null = null;
      if (createService.success && createService.data) {
        testServiceId = createService.data.id;
      }

      // Test GET /api/services/[id]
      if (testServiceId) {
        const getService = await this.makeRequest('GET', `/api/services/${testServiceId}`, undefined, 200);
        this.addResult(
          'GET /api/services/[id]',
          getService.success,
          getService.success ? 'Get service by ID works' : `Failed: ${getService.status}`,
          '2.2'
        );

        // Test PUT /api/services/[id]
        const updateService = await this.makeRequest(
          'PUT',
          `/api/services/${testServiceId}`,
          {
            name: 'Updated Test Service',
            domain: 'updated.example.com',
            internalPorts: [8080, 8081],
            externalPorts: [80, 81],
            vlan: '101',
            tags: ['test', 'updated']
          },
          200
        );
        this.addResult(
          'PUT /api/services/[id]',
          updateService.success,
          updateService.success ? 'Update service works' : `Failed: ${updateService.status}`,
          '2.4'
        );

        // Test DELETE /api/services/[id]
        const deleteService = await this.makeRequest('DELETE', `/api/services/${testServiceId}`, undefined, 200);
        this.addResult(
          'DELETE /api/services/[id]',
          deleteService.success,
          deleteService.success ? 'Delete service works' : `Failed: ${deleteService.status}`,
          '2.5'
        );
      }
    } else {
      this.addResult(
        'POST /api/services',
        false,
        'No groups available to test service creation',
        '2.3'
      );
    }

    // Test GET /api/groups/[id]/services
    if (testGroupId) {
      const groupServices = await this.makeRequest('GET', `/api/groups/${testGroupId}/services`, undefined, 200);
      this.addResult(
        'GET /api/groups/[id]/services',
        groupServices.success,
        groupServices.success ? 'Get services by group works' : `Failed: ${groupServices.status}`,
        '2.1'
      );
    } else {
      this.addResult(
        'GET /api/groups/[id]/services',
        false,
        'No groups available to test services by group endpoint',
        '2.1'
      );
    }
  }

  /**
   * Verify data validation (Requirements 4.1-4.5)
   */
  private async verifyDataValidation() {
    console.log('\n🔍 Verifying Data Validation...');

    // Test invalid group creation
    const invalidGroup = await this.makeRequest(
      'POST',
      '/api/groups',
      { name: '' }, // Empty name should fail
      400
    );
    this.addResult(
      'Group validation - empty name',
      invalidGroup.success && invalidGroup.status === 400,
      invalidGroup.status === 400 ? 'Empty name validation works' : 'Empty name validation failed',
      '4.1'
    );

    // Test invalid service creation
    const invalidService = await this.makeRequest(
      'POST',
      '/api/services',
      {
        groupId: 'nonexistent',
        name: 'Test',
        domain: 'test.com',
        internalPorts: [99999], // Invalid port
        externalPorts: [80],
        ipAddress: 'invalid-ip' // Invalid IP
      },
      400
    );
    this.addResult(
      'Service validation - invalid data',
      invalidService.success && invalidService.status === 400,
      invalidService.status === 400 ? 'Invalid data validation works' : 'Invalid data validation failed',
      '4.2, 4.3, 4.4'
    );
  }

  /**
   * Verify CORS configuration
   */
  private async verifyCORS() {
    console.log('\n🔍 Verifying CORS Configuration...');

    // Test OPTIONS request
    const optionsRequest = await this.makeRequest('OPTIONS', '/api/groups', undefined, 200);
    this.addResult(
      'CORS preflight request',
      optionsRequest.success,
      optionsRequest.success ? 'OPTIONS request works' : `Failed: ${optionsRequest.status}`,
      '5.3'
    );
  }

  /**
   * Verify microservice architecture (Requirements 5.1-5.4)
   */
  private verifyArchitecture() {
    console.log('\n🔍 Verifying Architecture...');

    // Check if API directory structure exists
    const apiDirs = [
      'api/controllers',
      'api/services',
      'api/repositories',
      'api/models',
      'api/middleware',
      'api/utils',
      'api/database'
    ];

    let allDirsExist = true;
    for (const dir of apiDirs) {
      const exists = existsSync(path.join(process.cwd(), dir));
      if (!exists) allDirsExist = false;
    }

    this.addResult(
      'Microservice directory structure',
      allDirsExist,
      allDirsExist ? 'All required directories exist' : 'Some directories missing',
      '5.1, 5.2'
    );

    // Check if Next.js API routes exist
    const apiRoutes = [
      'app/api/groups/route.ts',
      'app/api/services/route.ts',
      'app/api/health/route.ts'
    ];

    let allRoutesExist = true;
    for (const route of apiRoutes) {
      const exists = existsSync(path.join(process.cwd(), route));
      if (!exists) allRoutesExist = false;
    }

    this.addResult(
      'API routes structure',
      allRoutesExist,
      allRoutesExist ? 'All API routes exist' : 'Some API routes missing',
      '5.2'
    );
  }

  /**
   * Run all verification tests
   */
  public async runVerification(): Promise<boolean> {
    console.log('🚀 Starting Requirements Verification...\n');

    // Check if server is running
    console.log('Checking if development server is running...');
    const healthCheck = await this.makeRequest('GET', '/api/health');
    if (!healthCheck.success) {
      console.log('❌ Development server is not running. Please start it with: npm run dev');
      return false;
    }
    console.log('✅ Development server is running\n');

    // Run all verification tests
    this.verifyDatabaseSetup();
    await this.verifyHealthCheck();
    await this.verifyGroupsAPI();
    await this.verifyServicesAPI();
    await this.verifyDataValidation();
    await this.verifyCORS();
    this.verifyArchitecture();

    // Summary
    console.log('\n📊 Verification Summary:');
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    const passRate = ((passed / total) * 100).toFixed(1);

    console.log(`✅ Passed: ${passed}/${total} (${passRate}%)`);
    
    if (passed < total) {
      console.log(`❌ Failed: ${total - passed}/${total}`);
      console.log('\nFailed tests:');
      this.results
        .filter(r => !r.passed)
        .forEach(r => console.log(`  - ${r.name}: ${r.message}`));
    }

    const allPassed = passed === total;
    console.log(`\n${allPassed ? '🎉' : '⚠️'} Overall: ${allPassed ? 'ALL REQUIREMENTS VERIFIED' : 'SOME REQUIREMENTS FAILED'}`);

    return allPassed;
  }
}

// Run verification if called directly
if (require.main === module) {
  const verifier = new RequirementsVerifier();
  verifier.runVerification().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Verification failed with error:', error);
    process.exit(1);
  });
}

export { RequirementsVerifier };