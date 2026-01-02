import { queryEvents } from '@/lib/db';
import { WorkoutMetadata } from '@/types';
import { groupWorkoutsByDate } from '@/utils/workoutFilters';
import Link from 'next/link';
import { ArrowLeft, Activity, Heart, Zap, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

export default async function WorkoutsPage() {
    const events = await queryEvents({});
    const workoutsByDate = groupWorkoutsByDate(events);

    return (
        <main className="min-h-screen bg-[var(--background)]">
            {/* Header */}
            <header className="border-b border-[var(--card-border)] bg-[var(--card-bg)]/50 backdrop-blur-xl sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="p-2 hover:bg-[var(--card-border)] rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold gradient-text">🏃‍♂️ 운동 기록</h1>
                            <p className="text-[var(--text-secondary)] mt-1">
                                Apple Watch 운동 데이터 히스토리
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {workoutsByDate.size === 0 ? (
                    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-12 text-center">
                        <div className="text-6xl mb-4">🏃‍♂️</div>
                        <h2 className="text-2xl font-bold mb-2">아직 운동 기록이 없습니다</h2>
                        <p className="text-[var(--text-secondary)] mb-6">
                            Apple Watch로 운동을 시작하고 iPhone 단축어로 데이터를 업로드하세요.
                        </p>
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 max-w-md mx-auto">
                            <p className="text-sm text-[var(--text-secondary)]">
                                💡 <strong>Tip:</strong> APPLE_WATCH_SETUP_EN.md 파일을 참고하여 자동 업로드를 설정하세요.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {Array.from(workoutsByDate.entries()).map(([dateKey, workouts]) => {
                            const date = new Date(dateKey + 'T00:00:00');
                            const isToday = dateKey === new Date().toISOString().split('T')[0];

                            // Calculate daily totals
                            const dailyDistance = workouts.reduce((sum, w) => {
                                const m = w.metadata as WorkoutMetadata;
                                return sum + (m?.distance_meters || 0);
                            }, 0);

                            const dailyCalories = workouts.reduce((sum, w) => {
                                const m = w.metadata as WorkoutMetadata;
                                return sum + (m?.active_calories || 0);
                            }, 0);

                            return (
                                <div key={dateKey} className="space-y-4">
                                    {/* Date Header */}
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-2xl font-bold">
                                            {format(date, 'M월 d일 (EEE)', { locale: ko })}
                                        </h2>
                                        {isToday && (
                                            <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-sm font-medium rounded-full">
                                                오늘
                                            </span>
                                        )}
                                        <span className="text-sm text-[var(--text-secondary)]">
                                            {(dailyDistance / 1000).toFixed(1)}km · {dailyCalories}kcal
                                        </span>
                                    </div>

                                    {/* Workout Cards */}
                                    <div className="grid gap-4">
                                        {workouts.map((workout) => {
                                            const metadata = workout.metadata as WorkoutMetadata;
                                            const distanceKm = (metadata.distance_meters / 1000).toFixed(1);
                                            const durationMin = Math.round(metadata.duration_seconds / 60);

                                            return (
                                                <div
                                                    key={workout.id}
                                                    className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 hover:border-blue-500/50 transition-colors"
                                                >
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-3 bg-blue-500/10 rounded-xl">
                                                                <Activity className="w-6 h-6 text-blue-500" />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-semibold capitalize">{metadata.workout_type}</h3>
                                                                <p className="text-sm text-[var(--text-secondary)]">
                                                                    {format(new Date(workout.timestamp), 'HH:mm')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Stats Grid */}
                                                    <div className="grid grid-cols-4 gap-4 mb-4">
                                                        <div className="text-center p-3 bg-[var(--background)] rounded-lg">
                                                            <div className="text-xs text-[var(--text-secondary)] mb-1">거리</div>
                                                            <div className="text-lg font-bold text-blue-500">{distanceKm}km</div>
                                                        </div>
                                                        <div className="text-center p-3 bg-[var(--background)] rounded-lg">
                                                            <div className="text-xs text-[var(--text-secondary)] mb-1">시간</div>
                                                            <div className="text-lg font-bold text-green-500">{durationMin}분</div>
                                                        </div>
                                                        <div className="text-center p-3 bg-[var(--background)] rounded-lg">
                                                            <div className="text-xs text-[var(--text-secondary)] mb-1">칼로리</div>
                                                            <div className="text-lg font-bold text-orange-500">{metadata.active_calories}</div>
                                                        </div>
                                                        <div className="text-center p-3 bg-[var(--background)] rounded-lg">
                                                            <div className="text-xs text-[var(--text-secondary)] mb-1">평균심박</div>
                                                            <div className="text-lg font-bold text-red-500">{metadata.avg_heart_rate}</div>
                                                        </div>
                                                    </div>

                                                    {/* Additional Metrics */}
                                                    {(metadata.avg_pace_min_per_km || metadata.avg_cadence || metadata.elevation_gain) && (
                                                        <div className="flex gap-4 text-sm text-[var(--text-secondary)] pt-3 border-t border-[var(--card-border)]">
                                                            {metadata.avg_pace_min_per_km && (
                                                                <span>페이스: {metadata.avg_pace_min_per_km.toFixed(1)}분/km</span>
                                                            )}
                                                            {metadata.avg_cadence && (
                                                                <span>케이던스: {metadata.avg_cadence}spm</span>
                                                            )}
                                                            {metadata.elevation_gain && (
                                                                <span>고도: +{metadata.elevation_gain}m</span>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Heart Rate Samples Info */}
                                                    {metadata.heart_rate_samples && metadata.heart_rate_samples.length > 0 && (
                                                        <div className="mt-3 text-xs text-[var(--text-secondary)]">
                                                            💓 심박수 샘플: {metadata.heart_rate_samples.length}개 (최대 {metadata.max_heart_rate}bpm)
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}
