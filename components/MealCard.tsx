'use client';

import { EventLog, MealMetadata, FoodItem } from '@/types';
import { Utensils, Trash2, X, ChevronDown, ChevronRight, Clock, Flame } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale/ko';
import { toZonedTime } from 'date-fns-tz';
import { useState } from 'react';
import MealProgress from './MealProgress';

interface MealCardProps {
    events: EventLog[];
}

type TimeGroup = '아침' | '점심' | '저녁' | '간식';

export default function MealCard({ events }: MealCardProps) {
    const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [expandedGroups, setExpandedGroups] = useState<Set<TimeGroup>>(
        new Set(['아침', '점심', '저녁', '간식'])
    );

    const mealEvents = events
        .filter(e => e.activity_type === 'MEAL' && !deletingIds.has(e.id))
        .map(e => ({
            ...e,
            metadata: e.metadata as MealMetadata,
            date: toZonedTime(new Date(e.timestamp), 'Asia/Seoul')
        }));

    // Group meals by time
    const groupedMeals = mealEvents.reduce((acc, event) => {
        const hour = event.date.getHours();
        let group: TimeGroup = '간식';

        if (hour >= 5 && hour < 11) group = '아침';
        else if (hour >= 11 && hour < 16) group = '점심';
        else if (hour >= 16 && hour < 22) group = '저녁';

        if (!acc[group]) acc[group] = [];
        acc[group].push(event);
        return acc;
    }, {} as Record<TimeGroup, typeof mealEvents>);

    const toggleGroup = (group: TimeGroup) => {
        setExpandedGroups(prev => {
            const newSet = new Set(prev);
            if (newSet.has(group)) {
                newSet.delete(group);
            } else {
                newSet.add(group);
            }
            return newSet;
        });
    };

    const toggleExpand = (eventId: string) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(eventId)) {
                newSet.delete(eventId);
            } else {
                newSet.add(eventId);
            }
            return newSet;
        });
    };

    const handleDelete = async (eventId: string) => {
        if (!confirm('이 식사 기록을 삭제하시겠습니까?')) return;

        setDeletingIds(prev => new Set(prev).add(eventId));

        try {
            const response = await fetch(`/api/events/${eventId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete');

            // Success - the UI will update automatically due to state change
        } catch (error) {
            console.error('Error deleting event:', error);
            alert('삭제 중 오류가 발생했습니다.');
            setDeletingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(eventId);
                return newSet;
            });
        }
    };

    const groupOrder: TimeGroup[] = ['아침', '점심', '저녁', '간식'];

    return (
        <div className="space-y-6">
            {/* Daily Dashboard */}
            <MealProgress todayMeals={mealEvents} />

            {/* Grouped Meal List */}
            <div className="space-y-4">
                {groupOrder.map(group => {
                    const groupMeals = groupedMeals[group] || [];
                    if (groupMeals.length === 0) return null;

                    const groupCalories = groupMeals.reduce((sum, e) => sum + (e.metadata.calories || 0), 0);
                    const isGroupExpanded = expandedGroups.has(group);

                    return (
                        <div key={group} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl overflow-hidden">
                            {/* Group Header */}
                            <button
                                onClick={() => toggleGroup(group)}
                                className="w-full flex items-center justify-between p-4 bg-[var(--background)] hover:bg-[var(--card-bg)] transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-semibold">{group}</span>
                                    <span className="text-sm text-[var(--text-secondary)]">({groupMeals.length})</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-orange-500">{groupCalories.toLocaleString()} kcal</span>
                                    {isGroupExpanded ? <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" /> : <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />}
                                </div>
                            </button>

                            {/* Meal Cards */}
                            {isGroupExpanded && (
                                <div className="divide-y divide-[var(--card-border)]">
                                    {groupMeals.map(event => {
                                        const isExpanded = expandedRows.has(event.id);
                                        const hasDetails = event.metadata.food_items && event.metadata.food_items.length > 0;
                                        const pfc = event.metadata.pfc_ratio;

                                        return (
                                            <div key={event.id} className="p-4 hover:bg-[var(--background)] transition-colors">
                                                {/* Card Header & Main Info */}
                                                <div className="flex gap-4">
                                                    {/* Thumbnail */}
                                                    <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                                                        {event.metadata.image_url ? (
                                                            <img
                                                                src={event.metadata.image_url}
                                                                alt={event.metadata.menu_name}
                                                                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedImage(event.metadata.image_url!);
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Utensils className="w-6 h-6 text-gray-400" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <h3 className="font-semibold text-lg truncate pr-2">
                                                                {event.metadata.menu_name || '알 수 없는 식사'}
                                                            </h3>
                                                            <button
                                                                onClick={(e) => handleDelete(event.id, e)}
                                                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>

                                                        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-2">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            <span>{format(event.date, 'HH:mm', { locale: ko })}</span>
                                                            {event.metadata.calories > 0 && (
                                                                <>
                                                                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                                                                    <span className="font-medium text-orange-500">{event.metadata.calories.toLocaleString()} kcal</span>
                                                                </>
                                                            )}
                                                        </div>

                                                        {/* Macronutrients Bar */}
                                                        {pfc && (
                                                            <div className="w-full h-1.5 flex rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 mb-2">
                                                                <div className="bg-blue-400" style={{ width: `${pfc.carbs}%` }} />
                                                                <div className="bg-green-400" style={{ width: `${pfc.protein}%` }} />
                                                                <div className="bg-yellow-400" style={{ width: `${pfc.fat}%` }} />
                                                            </div>
                                                        )}

                                                        <div className="flex gap-3 text-xs text-[var(--text-secondary)]">
                                                            <span>탄 <span className="text-blue-500">{Math.round(event.metadata.carbohydrates || 0)}g</span></span>
                                                            <span>단 <span className="text-green-500">{Math.round(event.metadata.protein || 0)}g</span></span>
                                                            <span>지 <span className="text-yellow-500">{Math.round(event.metadata.fat || 0)}g</span></span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Expand Details Button */}
                                                {hasDetails && (
                                                    <button
                                                        onClick={() => toggleExpand(event.id)}
                                                        className="w-full mt-3 flex items-center justify-center gap-1 py-1.5 text-xs text-[var(--text-secondary)] bg-[var(--background)] rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                    >
                                                        {isExpanded ? '상세 정보 접기' : '개별 음식 정보 보기'}
                                                        {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                                    </button>
                                                )}

                                                {/* Expanded Details */}
                                                {isExpanded && hasDetails && (
                                                    <div className="mt-3 space-y-2 p-3 bg-[var(--background)] rounded-xl">
                                                        {event.metadata.food_items!.map((item, idx) => (
                                                            <div key={idx} className="flex justify-between items-center text-sm">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                                                                    <span className="font-medium">{item.name}</span>
                                                                    <span className="text-xs text-[var(--text-secondary)]">({item.portion_size})</span>
                                                                </div>
                                                                <div className="text-xs">
                                                                    <span className="font-medium">{item.calories} kcal</span>
                                                                    <span className="text-[var(--text-secondary)] ml-2">
                                                                        탄{item.carbohydrates.toFixed(0)}·단{item.protein.toFixed(0)}·지{item.fat.toFixed(0)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}

                {mealEvents.length === 0 && (
                    <div className="text-center py-12 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl">
                        <Utensils className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-3 opacity-50" />
                        <p className="text-[var(--text-secondary)]">오늘의 식사 기록이 없습니다</p>
                        <p className="text-sm text-[var(--text-secondary)] mt-1">
                            단축어로 첫 끼니를 기록해보세요
                        </p>
                    </div>
                )}
            </div>

            {/* Image Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="w-8 h-8 text-white" />
                    </button>
                    <img
                        src={selectedImage}
                        alt="Food"
                        className="max-w-full max-h-[85vh] rounded-xl shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
}
