import fs from 'fs';
import path from 'path';
import { EventLog, ActivityType, EventQueryParams } from '@/types';

const DB_PATH = path.join(process.cwd(), 'data', 'events.json');

/**
 * Ensure the data directory and file exist
 */
function ensureDbFile(): void {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2), 'utf-8');
    }
}

/**
 * Read all events from the database
 */
export function readEvents(): EventLog[] {
    ensureDbFile();
    try {
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(data) as EventLog[];
    } catch (error) {
        console.error('Error reading events:', error);
        return [];
    }
}

/**
 * Write events to the database
 * Thread-safe write operation
 */
export function writeEvents(events: EventLog[]): void {
    ensureDbFile();
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(events, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error writing events:', error);
        throw new Error('Failed to write events to database');
    }
}

/**
 * Add a new event to the database
 */
export function addEvent(event: Omit<EventLog, 'id' | 'created_at'>): EventLog {
    const events = readEvents();

    const newEvent: EventLog = {
        ...event,
        id: generateId(),
        created_at: new Date().toISOString(),
    };

    events.push(newEvent);
    writeEvents(events);

    return newEvent;
}

/**
 * Query events with filters
 */
export function queryEvents(params: EventQueryParams): EventLog[] {
    let events = readEvents();

    // Filter by user_id
    if (params.user_id) {
        events = events.filter(e => e.user_id === params.user_id);
    }

    // Filter by activity_type
    if (params.activity_type) {
        events = events.filter(e => e.activity_type === params.activity_type);
    }

    // Filter by date range
    if (params.start_date) {
        const startDate = new Date(params.start_date);
        events = events.filter(e => new Date(e.timestamp) >= startDate);
    }

    if (params.end_date) {
        const endDate = new Date(params.end_date);
        events = events.filter(e => new Date(e.timestamp) <= endDate);
    }

    // Sort by timestamp (newest first)
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return events;
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
