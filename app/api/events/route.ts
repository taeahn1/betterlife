import { NextRequest, NextResponse } from 'next/server';
import { queryEvents } from '@/lib/db';
import { ApiResponse, EventLog, ActivityType } from '@/types';

/**
 * GET /api/events
 * 
 * Retrieve events with optional filtering
 * 
 * Query Parameters:
 * - user_id: Filter by user ID
 * - activity_type: Filter by activity type (MEDITATION_START, MEAL, etc.)
 * - start_date: Filter events after this date (ISO-8601)
 * - end_date: Filter events before this date (ISO-8601)
 * 
 * Examples:
 * - /api/events?user_id=user123
 * - /api/events?user_id=user123&activity_type=MEDITATION_START
 * - /api/events?start_date=2025-12-01T00:00:00Z&end_date=2025-12-31T23:59:59Z
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        // Parse query parameters
        const user_id = searchParams.get('user_id') || undefined;
        const activity_type = searchParams.get('activity_type') as ActivityType | undefined;
        const start_date = searchParams.get('start_date') || undefined;
        const end_date = searchParams.get('end_date') || undefined;

        // Query events
        const events = await queryEvents({
            user_id,
            activity_type,
            start_date,
            end_date,
        });

        // Return success response
        return NextResponse.json<ApiResponse<EventLog[]>>(
            {
                success: true,
                data: events,
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error retrieving events:', error);
        return NextResponse.json<ApiResponse>(
            {
                success: false,
                error: 'Internal server error',
            },
            { status: 500 }
        );
    }
}
