import { NextRequest, NextResponse } from 'next/server';
import { addEvent } from '@/lib/db';
import { ActivityType, WorkoutMetadata, ApiResponse, EventLog } from '@/types';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const {
            user_id,
            workout_type,
            start_time,
            end_time,
            duration_seconds,
            distance_meters,
            active_calories,
            total_calories,
            avg_heart_rate,
            max_heart_rate,
            min_heart_rate,
            avg_pace_min_per_km,
            avg_speed_kmh,
            max_speed_kmh,
            avg_cadence,
            elevation_gain,
            elevation_descent,
            heart_rate_samples,
            pace_samples,
            cadence_samples,
            route_points
        } = body;

        // Validation
        if (!user_id || !workout_type || !start_time || !duration_seconds) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: 'Missing required fields: user_id, workout_type, start_time, duration_seconds'
                },
                { status: 400 }
            );
        }

        // Validate heart rate samples size (prevent too large payloads)
        if (heart_rate_samples && heart_rate_samples.length > 10000) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: 'Too many heart rate samples (max 10,000). Please sample the data.'
                },
                { status: 400 }
            );
        }

        // Create metadata
        const metadata: WorkoutMetadata = {
            workout_type,
            start_time,
            end_time: end_time || start_time,
            duration_seconds,
            distance_meters: distance_meters || 0,
            active_calories: active_calories || 0,
            total_calories: total_calories || 0,
            avg_heart_rate: avg_heart_rate || 0,
            max_heart_rate: max_heart_rate || 0,
            min_heart_rate: min_heart_rate || 0,
            avg_pace_min_per_km,
            avg_speed_kmh,
            max_speed_kmh,
            avg_cadence,
            elevation_gain,
            elevation_descent,
            heart_rate_samples: heart_rate_samples || [],
            pace_samples,
            cadence_samples,
            route_points
        };

        // Store in database
        const event = await addEvent({
            user_id,
            activity_type: ActivityType.WORKOUT,
            timestamp: start_time,
            metadata
        });

        console.log('Workout saved:', {
            id: event.id,
            type: workout_type,
            duration: duration_seconds,
            hr_samples: heart_rate_samples?.length || 0
        });

        return NextResponse.json<ApiResponse<EventLog>>(
            {
                success: true,
                data: event
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('Error saving workout:', error);
        return NextResponse.json<ApiResponse>(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to save workout'
            },
            { status: 500 }
        );
    }
}
