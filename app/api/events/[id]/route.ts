import { NextRequest, NextResponse } from 'next/server';
import { queryEvents } from '@/lib/db';
import { EventLog, MealMetadata } from '@/types';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { portion_consumed } = await request.json();
        const eventId = params.id;

        if (typeof portion_consumed !== 'number' || portion_consumed < 0.2 || portion_consumed > 1.0) {
            return NextResponse.json(
                { success: false, error: 'Invalid portion_consumed value (must be 0.2-1.0)' },
                { status: 400 }
            );
        }

        // Get the event
        const events = await queryEvents({});
        const event = events.find(e => e.id === eventId);

        if (!event || event.activity_type !== 'MEAL') {
            return NextResponse.json(
                { success: false, error: 'Event not found' },
                { status: 404 }
            );
        }

        const metadata = event.metadata as MealMetadata;

        // Calculate consumed values
        const updatedMetadata: MealMetadata = {
            ...metadata,
            portion_consumed,
            consumed_calories: Math.round(metadata.calories * portion_consumed),
            consumed_carbs: Math.round(metadata.carbohydrates * portion_consumed),
            consumed_protein: Math.round(metadata.protein * portion_consumed),
            consumed_fat: Math.round(metadata.fat * portion_consumed),
        };

        // Update in Supabase
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { error } = await supabase
            .from('events')
            .update({ metadata: updatedMetadata })
            .eq('id', eventId);

        if (error) throw error;

        return NextResponse.json({ success: true, data: updatedMetadata });

    } catch (error) {
        console.error('Error updating portion:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update portion' },
            { status: 500 }
        );
    }
}
