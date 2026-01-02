import { EventLog } from '@/types';
import { startOfDay, isSameDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const TIMEZONE = 'Asia/Seoul';

/**
 * Filter events to get only today's workouts
 */
export function filterTodayWorkouts(events: EventLog[]): EventLog[] {
    const now = new Date();
    const today = startOfDay(toZonedTime(now, TIMEZONE));

    return events.filter(e => {
        if (e.activity_type !== 'WORKOUT') return false;
        const eventDate = startOfDay(toZonedTime(new Date(e.timestamp), TIMEZONE));
        return isSameDay(eventDate, today);
    });
}

/**
 * Group workouts by date (YYYY-MM-DD format)
 */
export function groupWorkoutsByDate(events: EventLog[]): Map<string, EventLog[]> {
    const workoutEvents = events.filter(e => e.activity_type === 'WORKOUT');
    const grouped = new Map<string, EventLog[]>();

    workoutEvents.forEach(event => {
        const eventDate = toZonedTime(new Date(event.timestamp), TIMEZONE);
        const dateKey = eventDate.toISOString().split('T')[0]; // YYYY-MM-DD

        if (!grouped.has(dateKey)) {
            grouped.set(dateKey, []);
        }
        grouped.get(dateKey)!.push(event);
    });

    // Sort by date descending (newest first)
    return new Map([...grouped.entries()].sort((a, b) => b[0].localeCompare(a[0])));
}
