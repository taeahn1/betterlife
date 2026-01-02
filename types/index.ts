/**
 * Activity types for life logging
 * Extensible enum to support various health and lifestyle tracking
 */
export enum ActivityType {
    MEDITATION_START = 'MEDITATION_START',
    MEDITATION_END = 'MEDITATION_END',
    MEAL = 'MEAL',
    HEART_RATE = 'HEART_RATE',
    EXERCISE = 'EXERCISE',
    SLEEP = 'SLEEP',
    MOOD = 'MOOD',
    SKIN_CHECK = 'SKIN_CHECK',
}

/**
 * Skin analysis detailed metadata
 * Stored in EventLog.metadata when activity_type is SKIN_CHECK
 */
export interface SkinAnalysisMetadata {
    // 1. Lesion Counts (Hard Count)
    lesion_counts: {
        non_inflammatory: number; // 좁쌀, 화이트헤드
        inflammatory: number;     // 염증성 (구진, 농포)
        cystic: number;           // 낭종, 결절
        large_lesions: number;    // 직경 5mm 이상
    };

    // 2. Spatial Mapping
    spatial_mapping: {
        primary_locations: string[]; // e.g. ["우측 볼", "턱선"]
        distribution_pattern: 'Clustered' | 'Scattered';
    };

    // 3. Asymmetry Index
    asymmetry: {
        left_count: number;
        right_count: number;
        diff_ratio: number; // e.g. 2.5 (Right is 2.5x more than Left)
        comment?: string;
    };

    // 4. Post-Acne Marking
    post_acne: {
        pigmentation_count: number; // 색소침착
        pitted_scars: boolean;      // 패인 흉터 유무
    };

    // 5. Integrated Scores
    scores: {
        inflammatory_score: number; // 가중치 점수
        spatial_risk_score: number; // 밀집 위험도
        total_health_index: number; // 0-100 (100 is best)
        status: 'Good' | 'Warning' | 'Danger';
    };

    // Images
    image_urls: {
        front?: string;
        left?: string;
        right?: string;
    };

    analysis_date: string; // ISO date
}

/**
 * Generic event log structure
 * Designed to accommodate various activity types with flexible metadata
 */
export interface EventLog {
    id: string;
    user_id: string;
    activity_type: ActivityType;
    timestamp: string; // ISO-8601 format
    metadata?: Record<string, any>; // Extensible field for activity-specific data
    created_at: string; // ISO-8601 format
}

/**
 * API request format for logging events
 * Compatible with iPhone Shortcuts and other external integrations
 */
export interface LogEventRequest {
    user_id: string;
    action: string; // Will be mapped to ActivityType
    timestamp: string; // ISO-8601 format
    metadata?: Record<string, any>;
}

/**
 * API response format
 */
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Query parameters for filtering events
 */
export interface EventQueryParams {
    user_id?: string;
    activity_type?: ActivityType;
    start_date?: string;
    end_date?: string;
}

/**
 * Individual food item in a meal
 */
export interface FoodItem {
    name: string;               // e.g., "연어 사시미"
    calories: number;           // kcal
    carbohydrates: number;      // g
    protein: number;            // g
    fat: number;                // g
    portion_size: string;       // e.g., "100g", "0.3개"
    quantity_description?: string; // e.g., "바나나 조각 2개", "샐러드 한 줌"
}

/**
 * Meal metadata structure for food photo analysis
 * Stored in EventLog.metadata when activity_type is MEAL
 */
export interface MealMetadata {
    // Basic Nutrition (The Big 4) - Total for entire meal
    calories: number;           // kcal
    carbohydrates: number;      // g
    protein: number;            // g
    fat: number;                // g

    // Food Identity
    menu_name: string;          // e.g., "연어 아보카도 덮밥 세트" (overall meal name)
    food_category: string;      // e.g., "한식", "양식", "간식"
    ingredients: string[];      // e.g., ["연어", "아보카도", "현미밥"]

    // Portion & Ratio
    portion_size: string;       // e.g., "1인분", "0.5인분"
    pfc_ratio: {
        protein: number;        // % of total calories
        fat: number;            // % of total calories
        carbs: number;          // % of total calories
    };

    // Detailed breakdown by individual food items
    food_items?: FoodItem[];    // Array of individual foods in the photo

    // Image
    image_url?: string;         // Optional: stored image URL

    // Portion consumed (for tracking actual intake)
    portion_consumed: number;   // 0.2 to 1.0 (20% to 100%), default 1.0
    consumed_calories: number;  // Actual consumed calories
    consumed_carbs: number;     // Actual consumed carbs
    consumed_protein: number;   // Actual consumed protein
    consumed_fat: number;       // Actual consumed fat
}
