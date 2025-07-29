/**
 * Group Services API endpoint
 * Handles GET /api/groups/[id]/services
 */

import { NextRequest, NextResponse } from 'next/server';
import { DefaultNetworkServiceService } from '../../../../../api/services/NetworkServiceService';
import { ValidationError, NotFoundError } from '../../../../../api/utils/errors';

const networkServiceService = new DefaultNetworkServiceService();

/**
 * GET /api/groups/[id]/services - Get all services for a specific group
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const services = await networkServiceService.getServicesByGroup(id);
    return NextResponse.json(services, { status: 200 });
  } catch (error) {
    console.error('Error fetching services for group:', error);
    
    if (error instanceof ValidationError) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: error.message,
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }
    
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: error.message,
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to fetch services for group',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}