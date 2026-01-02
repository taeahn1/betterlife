import { EventLog } from '@/types';
import { startOfDay, isSameDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const TIMEZONE = 'Asia/Seoul';

/**
 * Filter events to get only today's meals
 */
export function filterTodayMeals(events: EventLog[]): EventLog[] {
    const now = new Date();
    const today = startOfDay(toZonedTime(now, TIMEZONE));

    return events.filter(e => {
        if (e.activity_type !== 'MEAL') return false;
        const eventDate = startOfDay(toZonedTime(new Date(e.timestamp), TIMEZONE));
        return isSameDay(eventDate, today);
    });
}

/**
 * Group meals by date (YYYY-MM-DD format)
 */
export function groupMealsByDate(events: EventLog[]): Map<string, EventLog[]> {
    const mealEvents = events.filter(e => e.activity_type === 'MEAL');
    const grouped = new Map<string, EventLog[]>();

    mealEvents.forEach(event => {
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

/**
 * Get meal time category based on hour
 */
export function getMealTimeCategory(timestamp: string): 'breakfast' | 'lunch' | 'dinner' | 'snack' {
    const time = toZonedTime(new Date(timestamp), TIMEZONE);
    const hour = time.getHours();

    if (hour >= 5 && hour < 11) return 'breakfast';
    if (hour >= 11 && hour < 16) return 'lunch';
    if (hour >= 16 && hour < 22) return 'dinner';
    return 'snack';
}

/**
 * Get meal time label in Korean
 */
export function getMealTimeLabel(category: string): string {
    const labels: Record<string, string> = {
        breakfast: '🌅 아침',
        lunch: '🌞 점심',
        dinner: '🌙 저녁',
        snack: '🍪 간식'
    };
    return labels[category] || category;
}
