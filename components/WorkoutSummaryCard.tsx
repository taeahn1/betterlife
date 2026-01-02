'use client';

import { EventLog, WorkoutMetadata } from '@/types';
import { Activity, Heart, Zap, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface WorkoutSummaryCardProps {
    todayWorkouts: EventLog[];
}

export default function WorkoutSummaryCard({ todayWorkouts }: WorkoutSummaryCardProps) {
    // Calculate totals
    const totalDistance = todayWorkouts.reduce((sum, w) => {
        const metadata = w.metadata as WorkoutMetadata;
        return sum + (metadata?.distance_meters || 0);
    }, 0);

    const totalCalories = todayWorkouts.reduce((sum, w) => {
        const metadata = w.metadata as WorkoutMetadata;
        return sum + (metadata?.active_calories || 0);
    }, 0);

    const totalDuration = todayWorkouts.reduce((sum, w) => {
        const metadata = w.metadata as WorkoutMetadata;
        return sum + (metadata?.duration_seconds || 0);
    }, 0);

    const avgHeartRate = todayWorkouts.length > 0
        ? Math.round(todayWorkouts.reduce((sum, w) => {
            const metadata = w.metadata as WorkoutMetadata;
            return sum + (metadata?.avg_heart_rate || 0);
        }, 0) / todayWorkouts.length)
        : 0;

    const distanceKm = (totalDistance / 1000).toFixed(1);
    const durationMin = Math.round(totalDuration / 60);

    return (
        <Link href="/workouts">
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 hover:border-blue-500/50 transition-all cursor-pointer group">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-500/10 rounded-xl">
                            <Activity className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <h3 className="font-semibold">오늘의 운동</h3>
                            <p className="text-sm text-[var(--text-secondary)]">
                                {todayWorkouts.length}회 · {distanceKm}km
                            </p>
                        </div>
                    </div>
                </div>

                {todayWorkouts.length > 0 ? (
                    <div className="grid grid-cols-4 gap-3">
                        <div className="text-center">
                            <div className="text-xs text-[var(--text-secondary)] mb-1">거리</div>
                            <div className="font-bold text-blue-500">{distanceKm}km</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xs text-[var(--text-secondary)] mb-1">시간</div>
                            <div className="font-bold text-green-500">{durationMin}분</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xs text-[var(--text-secondary)] mb-1">칼로리</div>
                            <div className="font-bold text-orange-500">{totalCalories}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xs text-[var(--text-secondary)] mb-1">평균심박</div>
                            <div className="font-bold text-red-500">{avgHeartRate}</div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-4 text-sm text-[var(--text-secondary)]">
                        아직 운동 기록이 없습니다
                    </div>
                )}
            </div>
        </Link>
    );
}
