import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '../../../api/database/connection';
import { applyCorsHeaders } from '../../../api/middleware/cors';

/**
 * Health check endpoint
 * GET /api/health
 */
export async function GET(request: NextRequest) {
  try {
    const db = getDatabase();
    
    // Test database connection by running a simple query
    const tables = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `).all() as { name: string }[];
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.1.0',
      database: {
        status: 'connected',
        tables: tables.map(t => t.name)
      }
    };
    
    const response = NextResponse.json(healthData, { status: 200 });
    return applyCorsHeaders(response, request);
    
  } catch (error) {
    console.error('Health check failed:', error);
    
    const healthData = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.1.0',
      database: {
        status: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown database error'
      }
    };
    
    const response = NextResponse.json(healthData, { status: 503 });
    return applyCorsHeaders(response, request);
  }
}

/**
 * Handle preflight OPTIONS request
 */
export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  return applyCorsHeaders(response, request);
}