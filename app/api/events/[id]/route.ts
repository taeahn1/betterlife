import { NextRequest, NextResponse } from 'next/server';
import { deleteEvent } from '@/lib/db';
import { ApiResponse } from '@/types';

/**
 * DELETE /api/events/[id]
 * 
 * Delete a specific event by ID
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const eventId = params.id;

        if (!eventId) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: 'Event ID is required',
                },
                { status: 400 }
            );
        }

        // Delete the event
        await deleteEvent(eventId);

        // Return success response
        return NextResponse.json<ApiResponse>(
            {
                success: true,
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error deleting event:', error);
        return NextResponse.json<ApiResponse>(
            {
                success: false,
                error: 'Failed to delete event',
            },
            { status: 500 }
        );
    }
}
