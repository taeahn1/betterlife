'use client';

import { MealMetadata } from '@/types';
import { motion } from 'framer-motion';

interface MealProgressProps {
    todayMeals: MealMetadata[];
}

export default function MealProgress({ todayMeals }: MealProgressProps) {
    // Hardcoded goals for now
    const GOALS = {
        calories: 2000,
        carbs: 250,
        protein: 120,
        fat: 67
    };

    const total = todayMeals.reduce((acc, meal) => ({
        calories: acc.calories + (meal.calories || 0),
        carbs: acc.carbs + (meal.carbohydrates || 0),
        protein: acc.protein + (meal.protein || 0),
        fat: acc.fat + (meal.fat || 0)
    }), { calories: 0, carbs: 0, protein: 0, fat: 0 });

    const getPercent = (current: number, goal: number) => Math.min(Math.round((current / goal) * 100), 100);

    const metrics = [
        {
            label: '일일 칼로리',
            current: total.calories,
            goal: GOALS.calories,
            unit: 'kcal',
            color: 'bg-orange-500',
            bgColor: 'bg-orange-500/10'
        },
        {
            label: '탄수화물',
            current: total.carbs,
            goal: GOALS.carbs,
            unit: 'g',
            color: 'bg-blue-500',
            bgColor: 'bg-blue-500/10'
        },
        {
            label: '단백질',
            current: total.protein,
            goal: GOALS.protein,
            unit: 'g',
            color: 'bg-green-500',
            bgColor: 'bg-green-500/10'
        },
        {
            label: '지방',
            current: total.fat,
            goal: GOALS.fat,
            unit: 'g',
            color: 'bg-yellow-500',
            bgColor: 'bg-yellow-500/10'
        }
    ];

    return (
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                📊 오늘의 영양
                <span className="text-xs font-normal text-[var(--text-secondary)] px-2 py-0.5 bg-[var(--background)] rounded-full">
                    목표 {GOALS.calories.toLocaleString()} kcal
                </span>
            </h2>

            <div className="space-y-4">
                {metrics.map((metric, idx) => (
                    <div key={idx}>
                        <div className="flex justify-between text-sm mb-1.5">
                            <span className="font-medium text-[var(--text-secondary)]">{metric.label}</span>
                            <span className="font-medium">
                                {Math.round(metric.current).toLocaleString()}
                                <span className="text-[var(--text-secondary)] text-xs font-normal mx-1">/</span>
                                <span className="text-[var(--text-secondary)]">{metric.goal.toLocaleString()}{metric.unit}</span>
                            </span>
                        </div>
                        <div className={`h-3 w-full rounded-full ${metric.bgColor} overflow-hidden`}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${getPercent(metric.current, metric.goal)}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`h-full rounded-full ${metric.color}`}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t border-[var(--card-border)] flex justify-between text-xs text-[var(--text-secondary)]">
                <div className="text-center flex-1 border-r border-[var(--card-border)]">
                    <div className="mb-1">탄</div>
                    <div className="font-semibold text-blue-500 text-sm">
                        {total.calories > 0 ? Math.round((total.carbs * 4 / total.calories) * 100) : 0}%
                    </div>
                </div>
                <div className="text-center flex-1 border-r border-[var(--card-border)]">
                    <div className="mb-1">단</div>
                    <div className="font-semibold text-green-500 text-sm">
                        {total.calories > 0 ? Math.round((total.protein * 4 / total.calories) * 100) : 0}%
                    </div>
                </div>
                <div className="text-center flex-1">
                    <div className="mb-1">지</div>
                    <div className="font-semibold text-yellow-500 text-sm">
                        {total.calories > 0 ? Math.round((total.fat * 9 / total.calories) * 100) : 0}%
                    </div>
                </div>
            </div>
        </div>
    );
}
