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
