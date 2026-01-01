import { EventLog, ActivityType } from '@/types';
import { Moon, Sun, BedDouble } from 'lucide-react';
import { format, subDays, isSameDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

interface TimeInBedProps {
    todayEvents: EventLog[];
    yesterdayEvents: EventLog[];
}

export default function TimeInBed({ todayEvents, yesterdayEvents }: TimeInBedProps) {
    // 1. Find Morning Meditation (Today 04:00 ~ 11:00)
    // Wake up time = Morning Meditation Start Time
    const morningMeditation = todayEvents.find(e => {
        if (e.activity_type !== ActivityType.MEDITATION_START) return false;
        const time = toZonedTime(new Date(e.timestamp), 'Asia/Seoul');
        const hour = time.getHours();
        return hour >= 4 && hour < 11;
    });

    // 2. Find Night Meditation (Yesterday 22:00 ~ Today 02:00)
    // Bed time = Night Meditation Start Time + 15 mins
    const nightMeditation = [...yesterdayEvents, ...todayEvents].find(e => {
        if (e.activity_type !== ActivityType.MEDITATION_START) return false;
        const time = toZonedTime(new Date(e.timestamp), 'Asia/Seoul');
        const hour = time.getHours();

        // Check if it belongs to "Yesterday's Night" logic
        // It should be either Yesterday 22:00~23:59 OR Today 00:00~02:00
        const isYesterdayNight = isSameDay(time, subDays(new Date(), 1)) && hour >= 22;
        const isTodayDawn = isSameDay(time, new Date()) && hour < 2;

        return isYesterdayNight || isTodayDawn;
    });

    if (!morningMeditation || !nightMeditation) {
        return (
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                        <BedDouble className="w-5 h-5 text-indigo-500" />
                    </div>
                    <h2 className="text-lg font-semibold">Time in Bed</h2>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">
                    수면 데이터가 충분하지 않습니다. <br />
                    (밤 10시~2시, 아침 4시~11시 사이의 명상 기록이 필요해요)
                </p>
            </div>
        );
    }

    // Calculate Times
    const wakeTime = toZonedTime(new Date(morningMeditation.timestamp), 'Asia/Seoul');

    const bedTime = toZonedTime(new Date(nightMeditation.timestamp), 'Asia/Seoul');
    bedTime.setMinutes(bedTime.getMinutes() + 15); // Add 15 minutes rule

    // Calculate Duration
    const diffMs = wakeTime.getTime() - bedTime.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    // Determine Status Color
    const totalHours = diffHrs + (diffMins / 60);
    const isGoodSleep = totalHours >= 7 && totalHours <= 9;

    return (
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                        <BedDouble className="w-5 h-5 text-indigo-500" />
                    </div>
                    <h2 className="text-lg font-semibold">Time in Bed</h2>
                </div>
                <span className={`text-2xl font-bold ${isGoodSleep ? 'text-indigo-500' : 'text-[var(--text-primary)]'}`}>
                    {diffHrs}시간 {diffMins}분
                </span>
            </div>

            <div className="relative pt-2 pb-2">
                {/* Connector Line */}
                <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-gradient-to-r from-indigo-500/20 to-orange-500/20 -z-10" />

                <div className="flex justify-between items-center text-sm">
                    {/* Bed Time */}
                    <div className="flex flex-col items-center bg-[var(--card-bg)] px-2">
                        <div className="flex items-center gap-1.5 text-[var(--text-secondary)] mb-1">
                            <Moon className="w-4 h-4 text-indigo-400" />
                            <span>취침</span>
                        </div>
                        <span className="font-semibold text-lg">
                            {format(bedTime, 'HH:mm')}
                        </span>
                    </div>

                    {/* Wake Time */}
                    <div className="flex flex-col items-center bg-[var(--card-bg)] px-2">
                        <div className="flex items-center gap-1.5 text-[var(--text-secondary)] mb-1">
                            <Sun className="w-4 h-4 text-orange-400" />
                            <span>기상</span>
                        </div>
                        <span className="font-semibold text-lg">
                            {format(wakeTime, 'HH:mm')}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
