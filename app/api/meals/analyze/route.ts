import { NextRequest, NextResponse } from 'next/server';
import { addEvent } from '@/lib/db';
import { analyzeFoodImage } from '@/lib/gemini';
import { ApiResponse, EventLog, ActivityType, MealMetadata } from '@/types';

// Increase body size limit for image uploads
export const maxDuration = 60; // 60 seconds timeout for Gemini API

/**
 * POST /api/meals/analyze
 * 
 * Analyze food image and store meal data
 * 
 * Accepts multipart/form-data with:
 * - image: Image file
 * - timestamp: ISO-8601 timestamp
 * - user_id: User identifier
 */
export async function POST(request: NextRequest) {
    try {
        // Parse form data
        const formData = await request.formData();

        const imageFile = formData.get('image') as File | null;
        const timestamp = formData.get('timestamp') as string | null;
        const user_id = formData.get('user_id') as string | null;

        // Validate required fields
        if (!imageFile) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: 'Image file is required',
                },
                { status: 400 }
            );
        }

        if (!timestamp) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: 'Timestamp is required',
                },
                { status: 400 }
            );
        }

        if (!user_id) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: 'User ID is required',
                },
                { status: 400 }
            );
        }

        // Convert File to Buffer
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const mimeType = imageFile.type;

        // Analyze image with Gemini
        console.log('Analyzing food image with Gemini...');
        const mealData: MealMetadata = await analyzeFoodImage(buffer, mimeType);
        console.log('Analysis complete:', mealData);

        // Store event in database
        const event = await addEvent({
            user_id,
            activity_type: ActivityType.MEAL,
            timestamp,
            metadata: mealData,
        });

        // Return success response with analysis
        return NextResponse.json<ApiResponse<EventLog>>(
            {
                success: true,
                data: event,
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('Error analyzing meal:', error);
        return NextResponse.json<ApiResponse>(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to analyze meal',
            },
            { status: 500 }
        );
    }
}
