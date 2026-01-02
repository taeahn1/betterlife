import { createClient } from '@supabase/supabase-js';
import { EventLog, ActivityType, EventQueryParams } from '@/types';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Add a new event to the database
 */
export async function addEvent(event: Omit<EventLog, 'id' | 'created_at'>): Promise<EventLog> {
    const newEvent: EventLog = {
        ...event,
        id: generateId(),
        created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
        .from('events')
        .insert([newEvent])
        .select()
        .single();

    if (error) {
        console.error('Error adding event:', error);
        throw new Error('Failed to add event to database');
    }

    return data as EventLog;
}

/**
 * Query events with filters
 */
export async function queryEvents(params: EventQueryParams): Promise<EventLog[]> {
    let query = supabase
        .from('events')
        .select('*');

    // Filter by user_id
    if (params.user_id) {
        query = query.eq('user_id', params.user_id);
    }

    // Filter by activity_type
    if (params.activity_type) {
        query = query.eq('activity_type', params.activity_type);
    }

    // Filter by date range
    if (params.start_date) {
        query = query.gte('timestamp', params.start_date);
    }

    if (params.end_date) {
        query = query.lte('timestamp', params.end_date);
    }

    // Sort by timestamp (newest first)
    query = query.order('timestamp', { ascending: false });

    // Add limit to prevent timeout (default 1000)
    const limit = params.limit || 1000;
    query = query.limit(limit);

    const { data, error } = await query;

    if (error) {
        console.error('Error querying events:', error);
        throw new Error('Failed to query events from database');
    }

    return (data as EventLog[]) || [];
}

/**
 * Delete an event by ID
 */
export async function deleteEvent(eventId: string): Promise<void> {
    const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

    if (error) {
        console.error('Error deleting event:', error);
        throw new Error('Failed to delete event from database');
    }
}

/**
 * Generate a unique ID for events
 */
function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Map action string to ActivityType
 * Handles various input formats from external integrations
 */
export function mapActionToActivityType(action: string): ActivityType {
    const actionMap: Record<string, ActivityType> = {
        'meditation_start': ActivityType.MEDITATION_START,
        'meditation_end': ActivityType.MEDITATION_END,
        'meal': ActivityType.MEAL,
        'heart_rate': ActivityType.HEART_RATE,
        'exercise': ActivityType.EXERCISE,
        'sleep': ActivityType.SLEEP,
        'mood': ActivityType.MOOD,
    };

    const normalizedAction = action.toLowerCase().trim();
    const activityType = actionMap[normalizedAction];

    if (!activityType) {
        throw new Error(`Unknown action type: ${action}`);
    }

    return activityType;
}
