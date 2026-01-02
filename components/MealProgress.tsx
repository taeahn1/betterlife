'use client';

import { EventLog, MealMetadata } from '@/types';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Edit2, Check, X, RotateCcw } from 'lucide-react';

interface MealProgressProps {
    todayMeals: EventLog[];
}

export default function MealProgress({ todayMeals }: MealProgressProps) {
    const DEFAULT_GOALS = {
        calories: 2000,
        carbs: 250,
        protein: 120,
        fat: 67
    };

    const [goals, setGoals] = useState(DEFAULT_GOALS);
    const [isEditing, setIsEditing] = useState(false);
    const [tempGoals, setTempGoals] = useState(DEFAULT_GOALS);

    useEffect(() => {
        const saved = localStorage.getItem('nutrition_goals');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setGoals(parsed);
                setTempGoals(parsed);
            } catch (e) {
                console.error('Failed to parse saved goals', e);
            }
        }
    }, []);

    const startEditing = () => {
        setTempGoals(goals);
        setIsEditing(true);
    };

    const saveGoals = () => {
        setGoals(tempGoals);
        localStorage.setItem('nutrition_goals', JSON.stringify(tempGoals));
        setIsEditing(false);
    };

    const cancelEditing = () => {
        setTempGoals(goals);
        setIsEditing(false);
    };

    const resetGoals = () => {
        if (confirm('기본 설정값으로 초기화하시겠습니까?')) {
            setGoals(DEFAULT_GOALS);
            setTempGoals(DEFAULT_GOALS);
            localStorage.setItem('nutrition_goals', JSON.stringify(DEFAULT_GOALS));
            setIsEditing(false);
        }
    };

    const total = todayMeals.reduce((acc, event) => {
        const meal = event.metadata as MealMetadata;
        return {
            calories: acc.calories + (meal?.consumed_calories || meal?.calories || 0),
            carbs: acc.carbs + (meal?.consumed_carbs || meal?.carbohydrates || 0),
            protein: acc.protein + (meal?.consumed_protein || meal?.protein || 0),
            fat: acc.fat + (meal?.consumed_fat || meal?.fat || 0)
        };
    }, { calories: 0, carbs: 0, protein: 0, fat: 0 });

    const getPercent = (current: number, goal: number) => {
        if (goal <= 0) return 0;
        return Math.min(Math.round((current / goal) * 100), 100);
    };

    const metrics = [
        {
            key: 'calories' as const,
            label: '일일 칼로리',
            current: total.calories,
            goal: isEditing ? tempGoals.calories : goals.calories,
            unit: 'kcal',
            color: 'bg-orange-500',
            bgColor: 'bg-orange-500/10'
        },
        {
            key: 'carbs' as const,
            label: '탄수화물',
            current: total.carbs,
            goal: isEditing ? tempGoals.carbs : goals.carbs,
            unit: 'g',
            color: 'bg-blue-500',
            bgColor: 'bg-blue-500/10'
        },
        {
            key: 'protein' as const,
            label: '단백질',
            current: total.protein,
            goal: isEditing ? tempGoals.protein : goals.protein,
            unit: 'g',
            color: 'bg-green-500',
            bgColor: 'bg-green-500/10'
        },
        {
            key: 'fat' as const,
            label: '지방',
            current: total.fat,
            goal: isEditing ? tempGoals.fat : goals.fat,
            unit: 'g',
            color: 'bg-yellow-500',
            bgColor: 'bg-yellow-500/10'
        }
    ];

    return (
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    📊 오늘의 영양
                </h2>
                <div className="flex gap-1">
                    {isEditing ? (
                        <>
                            <button
                                onClick={resetGoals}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                title="초기화"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                            <button
                                onClick={cancelEditing}
                                className="p-1.5 text-gray-400 hover:text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                title="취소"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <button
                                onClick={saveGoals}
                                className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                                title="저장"
                            >
                                <Check className="w-4 h-4" />
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={startEditing}
                            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-border)] rounded-lg transition-colors"
                            title="목표 수정"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-5">
                {metrics.map((metric, idx) => (
                    <div key={idx}>
                        <div className="flex justify-between text-sm mb-1.5 h-6 items-center">
                            <span className="font-medium text-[var(--text-secondary)]">{metric.label}</span>
                            <div className="flex items-center gap-1">
                                <span className="font-medium">
                                    {Math.round(metric.current).toLocaleString()}
                                </span>
                                <span className="text-[var(--text-secondary)] text-xs font-normal mx-1">/</span>
                                {isEditing ? (
                                    <div className="flex items-center gap-1">
                                        <input
                                            type="number"
                                            value={metric.goal}
                                            onChange={(e) => setTempGoals(prev => ({
                                                ...prev,
                                                [metric.key]: Number(e.target.value) || 0
                                            }))}
                                            className="w-16 px-1.5 py-0.5 text-right bg-[var(--background)] border border-blue-500 rounded text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            autoFocus={idx === 0}
                                        />
                                        <span className="text-[var(--text-secondary)]">{metric.unit}</span>
                                    </div>
                                ) : (
                                    <span className="text-[var(--text-secondary)]">
                                        {metric.goal.toLocaleString()}{metric.unit}
                                    </span>
                                )}
                            </div>
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
        </div>
    );
}
