import { queryEvents } from '@/lib/db';
import MealCard from '@/components/MealCard';
import MealProgress from '@/components/MealProgress';
import { groupMealsByDate } from '@/utils/mealFilters';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

export default async function MealsPage() {
    const events = await queryEvents({});
    const mealsByDate = groupMealsByDate(events);

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
                            <h1 className="text-3xl font-bold gradient-text">🍽️ 식사 기록</h1>
                            <p className="text-[var(--text-secondary)] mt-1">
                                날짜별 영양 관리 히스토리
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {mealsByDate.size === 0 ? (
                    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-12 text-center">
                        <div className="text-6xl mb-4">🍽️</div>
                        <h2 className="text-2xl font-bold mb-2">아직 식사 기록이 없습니다</h2>
                        <p className="text-[var(--text-secondary)]">
                            iPhone 단축어로 음식 사진을 촬영하여 기록을 시작하세요.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {Array.from(mealsByDate.entries()).map(([dateKey, meals]) => {
                            const date = new Date(dateKey + 'T00:00:00');
                            const isToday = dateKey === new Date().toISOString().split('T')[0];

                            return (
                                <div key={dateKey} className="space-y-4">
                                    {/* Date Header */}
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-2xl font-bold">
                                            {format(date, 'M월 d일 (EEE)', { locale: ko })}
                                        </h2>
                                        {isToday && (
                                            <span className="px-3 py-1 bg-green-500/10 text-green-500 text-sm font-medium rounded-full">
                                                오늘
                                            </span>
                                        )}
                                    </div>

                                    {/* Nutrition Progress for Today */}
                                    {isToday && <MealProgress todayMeals={meals} />}

                                    {/* Meal Cards */}
                                    <MealCard events={meals} />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}
