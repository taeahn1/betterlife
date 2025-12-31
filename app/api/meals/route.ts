import { NextRequest, NextResponse } from 'next/server';
import { queryEvents } from '@/lib/db';
import { ApiResponse, EventLog, ActivityType } from '@/types';

/**
 * GET /api/meals
 * 
 * Query meal events with optional filters
 * 
 * Query parameters:
 * - user_id: Filter by user ID
 * - start_date: Filter by start date (ISO-8601)
 * - end_date: Filter by end date (ISO-8601)
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        // Parse query parameters
        const user_id = searchParams.get('user_id') || undefined;
        const start_date = searchParams.get('start_date') || undefined;
        const end_date = searchParams.get('end_date') || undefined;

        // Query meal events
        const events = await queryEvents({
            user_id,
            activity_type: ActivityType.MEAL,
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
        console.error('Error retrieving meals:', error);
        return NextResponse.json<ApiResponse>(
            {
                success: false,
                error: 'Failed to retrieve meals',
            },
            { status: 500 }
        );
    }
}
