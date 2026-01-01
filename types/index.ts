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
}
