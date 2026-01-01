import { NextRequest, NextResponse } from 'next/server';
import { analyzeSkinImages } from '@/lib/gemini-skin';
import { createEvent, updateEvent } from '@/lib/db';
import { ActivityType } from '@/types';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { images, user_id, timestamp } = body;
        // images: { left: string, front: string, right: string } (Base64 strings)

        if (!images || !user_id) {
            return NextResponse.json(
                { success: false, error: 'Missing images or user_id' },
                { status: 400 }
            );
        }

        // 1. Prepare buffers for Gemini
        // We expect images to be: { base64: "...", mimeType: "..." } or just base64 string
        // For simplicity, let's assume the shortcut sends { front: "base64...", left: "...", right: "..." }

        const imageInputs = [];
        if (images.left) imageInputs.push({ buffer: Buffer.from(images.left, 'base64'), mimeType: 'image/jpeg', position: 'left' as const });
        if (images.front) imageInputs.push({ buffer: Buffer.from(images.front, 'base64'), mimeType: 'image/jpeg', position: 'front' as const });
        if (images.right) imageInputs.push({ buffer: Buffer.from(images.right, 'base64'), mimeType: 'image/jpeg', position: 'right' as const });

        if (imageInputs.length === 0) {
            return NextResponse.json({ success: false, error: 'No valid images provided' }, { status: 400 });
        }

        // 2. Call Gemini Analysis
        const analysisResult = await analyzeSkinImages(imageInputs);

        // 3. Store Images (In a real app, upload to S3/Supabase Storage)
        // For this demo, we will store Base64 directly in metadata (Not recommended for prod, but fits current pattern)
        // Note: 3 images might be too large for Supabase row. 
        // OPTIMIZATION: We will NOT store full base64 in the DB event metadata if it's too huge.
        // Instead, we'll store a truncated version or just relies on the fact that the user has the original.
        // Actually, let's try storing them as Data URIs for the frontend to display.

        analysisResult.image_urls = {
            left: images.left ? `data:image/jpeg;base64,${images.left}` : undefined,
            front: images.front ? `data:image/jpeg;base64,${images.front}` : undefined,
            right: images.right ? `data:image/jpeg;base64,${images.right}` : undefined
        };

        // 4. Save Event to DB
        const event = await createEvent({
            user_id,
            activity_type: ActivityType.SKIN_CHECK,
            timestamp: timestamp || new Date().toISOString(),
            metadata: analysisResult
        });

        return NextResponse.json({ success: true, data: event });

    } catch (error: any) {
        console.error('Skin analysis failed:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
