import { NextRequest, NextResponse } from 'next/server';
import { addEvent } from '@/lib/db';
import { analyzeFoodImage } from '@/lib/gemini';
import { ApiResponse, EventLog, ActivityType, MealMetadata } from '@/types';

// Increase timeout for Gemini API
export const maxDuration = 60;

/**
 * POST /api/meals/analyze
 * 
 * Analyze food image and store meal data
 * 
 * Accepts JSON with:
 * - image_base64: Base64 encoded image string
 * - mime_type: Image MIME type (e.g., "image/jpeg")
 * - timestamp: ISO-8601 timestamp
 * - user_id: User identifier
 */
export async function POST(request: NextRequest) {
    try {
        // Parse JSON body
        const body = await request.json();

        const { image_base64, mime_type, timestamp, user_id } = body;

        // Validate required fields
        if (!image_base64) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: 'image_base64 is required',
                },
                { status: 400 }
            );
        }

        if (!mime_type) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: 'mime_type is required',
                },
                { status: 400 }
            );
        }

        if (!timestamp) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: 'timestamp is required',
                },
                { status: 400 }
            );
        }

        if (!user_id) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: 'user_id is required',
                },
                { status: 400 }
            );
        }

        // Convert base64 to Buffer
        const buffer = Buffer.from(image_base64, 'base64');

        // Analyze image with Gemini
        console.log('Analyzing food image with Gemini...');
        const mealData: MealMetadata = await analyzeFoodImage(buffer, mime_type);
        console.log('Analysis complete:', mealData);

        // Add image data and initialize consumed values (100% by default)
        const metadataWithImage: MealMetadata = {
            ...mealData,
            image_url: `data:${mime_type};base64,${image_base64}`,
            portion_consumed: 1.0,
            consumed_calories: mealData.calories,
            consumed_carbs: mealData.carbohydrates,
            consumed_protein: mealData.protein,
            consumed_fat: mealData.fat,
        };

        // Store event in database
        const event = await addEvent({
            user_id,
            activity_type: ActivityType.MEAL,
            timestamp,
            metadata: metadataWithImage,
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
