import { queryEvents } from '@/lib/db';
import MeditationCard from '@/components/MeditationCard';
import MealCard from '@/components/MealCard';
import StatsCard from '@/components/StatsCard';
import TimeInBed from '@/components/TimeInBed';
import { toZonedTime } from 'date-fns-tz';
import { isSameDay, subDays } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
    // Fetch all events
    const events = await queryEvents({});

    // Filter events for Today and Yesterday (KST)
    const now = new Date();
    const kstNow = toZonedTime(now, 'Asia/Seoul');
    const kstYesterday = subDays(kstNow, 1);

    const todayEvents = events.filter(e =>
        isSameDay(toZonedTime(new Date(e.timestamp), 'Asia/Seoul'), kstNow)
    );

    const yesterdayEvents = events.filter(e =>
        isSameDay(toZonedTime(new Date(e.timestamp), 'Asia/Seoul'), kstYesterday)
    );

    // Calculate stats
    const meditationCount = events.filter(
        e => e.activity_type === 'MEDITATION_START'
    ).length;

    const mealCount = events.filter(e => e.activity_type === 'MEAL').length;
    const exerciseCount = events.filter(e => e.activity_type === 'EXERCISE').length;
    const heartRateCount = events.filter(e => e.activity_type === 'HEART_RATE').length;

    return (
        <main className="min-h-screen bg-[var(--background)]">
            {/* Header */}
            <header className="border-b border-[var(--card-border)] bg-[var(--card-bg)]/50 backdrop-blur-xl sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold gradient-text">나의 라이프 로그</h1>
                            <p className="text-[var(--text-secondary)] mt-1">
                                일상의 모든 순간을 기록하고 성장하세요
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-slow"></div>
                            <span className="text-sm text-[var(--text-secondary)]">Live</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatsCard
                        title="운동"
                        description="활동 기록"
                        iconName="activity"
                        iconColor="text-orange-500"
                        iconBgColor="bg-orange-500/10"
                        count={exerciseCount}
                        comingSoon={exerciseCount === 0}
                    />
                    <StatsCard
                        title="식사"
                        description="영양 관리"
                        iconName="utensils"
                        iconColor="text-green-500"
                        iconBgColor="bg-green-500/10"
                        count={mealCount}
                        comingSoon={mealCount === 0}
                    />
                    <StatsCard
                        title="심박수"
                        description="건강 모니터링"
                        iconName="heart"
                        iconColor="text-red-500"
                        iconBgColor="bg-red-500/10"
                        count={heartRateCount}
                        comingSoon={heartRateCount === 0}
                    />
                    <StatsCard
                        title="Time in Bed"
                        description="수면 시간"
                        iconName="moon"
                        iconColor="text-indigo-500"
                        iconBgColor="bg-indigo-500/10"
                        count={0}
                        comingSoon={true}
                    />
                </div>

                {/* Time in Bed Card (New) */}
                <TimeInBed todayEvents={todayEvents} yesterdayEvents={yesterdayEvents} />

                {/* Meal Detail Card */}
                <div className="mb-8">
                    <MealCard events={events} />
                </div>

                {/* Meditation Detail Card */}
                <div className="mb-8">
                    <MeditationCard events={events} />
                </div>

                {/* Info Card */}
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold mb-2">🚀 시작하기</h3>
                    <p className="text-[var(--text-secondary)] mb-4">
                        아이폰 단축어나 액션 버튼을 설정하여 명상, 운동, 식사 등을 빠르게 기록하세요.
                    </p>
                    <div className="bg-[var(--background)] rounded-xl p-4 font-mono text-sm">
                        <p className="text-[var(--text-secondary)] mb-2">API 엔드포인트:</p>
                        <code className="text-purple-400">POST http://localhost:3000/api/log</code>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-[var(--card-border)] mt-16">
                <div className="max-w-7xl mx-auto px-6 py-8 text-center text-[var(--text-secondary)] text-sm">
                    <p>BetterLife - 더 나은 삶을 위한 라이프 로깅</p>
                </div>
            </footer>
        </main>
    );
}
