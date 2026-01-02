'use client';

import { EventLog, MealMetadata } from '@/types';
import { ChevronRight, Utensils } from 'lucide-react';
import Link from 'next/link';
import { getMealTimeCategory, getMealTimeLabel } from '@/utils/mealFilters';

interface MealSummaryCardProps {
    todayMeals: EventLog[];
}

export default function MealSummaryCard({ todayMeals }: MealSummaryCardProps) {
    // Calculate total calories
    const totalCalories = todayMeals.reduce((sum, meal) => {
        const metadata = meal.metadata as MealMetadata;
        return sum + (metadata?.calories || 0);
    }, 0);

    // Group by time
    const mealsByTime = todayMeals.reduce((acc, meal) => {
        const category = getMealTimeCategory(meal.timestamp);
        if (!acc[category]) acc[category] = [];
        acc[category].push(meal);
        return acc;
    }, {} as Record<string, EventLog[]>);

    const mealCount = todayMeals.length;

    return (
        <Link href="/meals">
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 mb-6 hover:border-green-500/50 transition-all cursor-pointer group">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-500/10 rounded-xl">
                            <Utensils className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                            <h3 className="font-semibold">오늘의 식사</h3>
                            <p className="text-sm text-[var(--text-secondary)]">
                                {mealCount}회 기록 · {totalCalories.toLocaleString()}kcal
                            </p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-green-500 transition-colors" />
                </div>

                {/* Quick Summary */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(time => {
                        const count = mealsByTime[time]?.length || 0;
                        const label = getMealTimeLabel(time).split(' ')[1];
                        return (
                            <div key={time} className="bg-[var(--background)] rounded-lg py-2">
                                <div className="font-bold text-lg">{count}</div>
                                <div className="text-[var(--text-secondary)]">{label}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Link>
    );
}
