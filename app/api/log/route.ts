import { NextRequest, NextResponse } from 'next/server';
import { addEvent, mapActionToActivityType } from '@/lib/db';
import { LogEventRequest, ApiResponse, EventLog } from '@/types';

/**
 * POST /api/log
 * 
 * Log a new event (meditation, meal, exercise, etc.)
 * 
 * This endpoint is designed to be called from:
 * - iPhone Shortcuts (단축어)
 * - Action Button automations
 * - Garmin Connect integrations
 * - Other external health tracking apps
 * 
 * === iPhone Shortcuts 연동 방법 ===
 * 
 * 1. iPhone에서 "단축어(Shortcuts)" 앱을 엽니다
 * 
 * 2. 새로운 단축어를 만들고 다음 작업을 추가합니다:
 *    - "URL 내용 가져오기" (Get Contents of URL)
 * 
 * 3. URL 설정:
 *    - URL: http://your-server-address:3000/api/log
 *    - 방법(Method): POST
 *    - 헤더(Headers):
 *      - Content-Type: application/json
 *    - 요청 본문(Request Body): JSON
 * 
 * 4. JSON 본문 예시:
 *    {
 *      "user_id": "your_user_id",
 *      "action": "meditation_start",
 *      "timestamp": "현재 날짜"
 *    }
 * 
 * 5. "현재 날짜"는 단축어의 "현재 날짜 가져오기" 작업을 사용하여
 *    ISO 8601 형식으로 포맷팅합니다
 * 
 * 6. Action Button에 할당하려면:
 *    - 설정 > 동작 버튼 > 단축어 > 생성한 단축어 선택
 * 
 * === 지원하는 action 값 ===
 * - meditation_start: 명상 시작
 * - meditation_end: 명상 종료
 * - meal: 식사 기록
 * - heart_rate: 심박수 기록
 * - exercise: 운동 기록
 * - sleep: 수면 기록
 * - mood: 기분 기록
 * 
 * === 확장 가능성 ===
 * metadata 필드를 사용하여 추가 데이터를 전송할 수 있습니다:
 * {
 *   "user_id": "user123",
 *   "action": "heart_rate",
 *   "timestamp": "2025-12-31T12:00:00+09:00",
 *   "metadata": {
 *     "bpm": 72,
 *     "source": "garmin"
 *   }
 * }
 */
export async function POST(request: NextRequest) {
    try {
        // Parse request body
        const body: LogEventRequest = await request.json();

        // Validate required fields
        if (!body.user_id || !body.action || !body.timestamp) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: 'Missing required fields: user_id, action, timestamp',
                },
                { status: 400 }
            );
        }

        // Validate timestamp format
        const timestamp = new Date(body.timestamp);
        if (isNaN(timestamp.getTime())) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: 'Invalid timestamp format. Use ISO-8601 format.',
                },
                { status: 400 }
            );
        }

        // Map action to ActivityType
        let activityType;
        try {
            activityType = mapActionToActivityType(body.action);
        } catch (error) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: error instanceof Error ? error.message : 'Invalid action type',
                },
                { status: 400 }
            );
        }

        // Create event
        const event = addEvent({
            user_id: body.user_id,
            activity_type: activityType,
            timestamp: body.timestamp,
            metadata: body.metadata,
        });

        // Return success response
        return NextResponse.json<ApiResponse<EventLog>>(
            {
                success: true,
                data: event,
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('Error logging event:', error);
        return NextResponse.json<ApiResponse>(
            {
                success: false,
                error: 'Internal server error',
            },
            { status: 500 }
        );
    }
}
