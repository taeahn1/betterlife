'use client';

import { EventLog, MealMetadata } from '@/types';
import { Utensils, Calendar, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale/ko';
import { toZonedTime } from 'date-fns-tz';
import { useState } from 'react';
import Image from 'next/image';

interface MealCardProps {
    events: EventLog[];
}

export default function MealCard({ events }: MealCardProps) {
    const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const mealEvents = events.filter(
        e => e.activity_type === 'MEAL' && !deletingIds.has(e.id)
    );

    const totalMeals = mealEvents.length;
    const totalCalories = mealEvents.reduce((sum, e) => {
        const metadata = e.metadata as MealMetadata;
        return sum + (metadata?.calories || 0);
    }, 0);

    const handleDelete = async (eventId: string) => {
        if (!confirm('이 식사 기록을 삭제하시겠습니까?')) {
            return;
        }

        setDeletingIds(prev => new Set(prev).add(eventId));

        try {
            const response = await fetch(`/api/events/${eventId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete event');
            }

            window.location.reload();
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

    return (
        <>
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 card-hover">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-orange-500/10 rounded-xl">
                        <Utensils className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">식사 기록</h2>
                        <p className="text-sm text-[var(--text-secondary)]">
                            총 {totalMeals}회 · {totalCalories.toLocaleString()} kcal
                        </p>
                    </div>
                </div>

                {mealEvents.length === 0 ? (
                    <div className="text-center py-12">
                        <Utensils className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-3 opacity-50" />
                        <p className="text-[var(--text-secondary)]">아직 식사 기록이 없습니다</p>
                        <p className="text-sm text-[var(--text-secondary)] mt-1">
                            아이폰 단축어로 음식 사진을 분석해보세요
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-[var(--card-border)]">
                                    <th className="text-left py-3 px-2 font-medium text-[var(--text-secondary)]">시간</th>
                                    <th className="text-left py-3 px-2 font-medium text-[var(--text-secondary)]">음식명</th>
                                    <th className="text-right py-3 px-2 font-medium text-[var(--text-secondary)]">칼로리</th>
                                    <th className="text-right py-3 px-2 font-medium text-[var(--text-secondary)]">탄수화물</th>
                                    <th className="text-right py-3 px-2 font-medium text-[var(--text-secondary)]">단백질</th>
                                    <th className="text-right py-3 px-2 font-medium text-[var(--text-secondary)]">지방</th>
                                    <th className="text-center py-3 px-2 font-medium text-[var(--text-secondary)]">비율</th>
                                    <th className="text-center py-3 px-2 font-medium text-[var(--text-secondary)]">사진</th>
                                    <th className="text-center py-3 px-2 font-medium text-[var(--text-secondary)]"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {mealEvents.map((event) => {
                                    const metadata = event.metadata as MealMetadata;
                                    const time = toZonedTime(new Date(event.timestamp), 'Asia/Seoul');

                                    return (
                                        <tr
                                            key={event.id}
                                            className="border-b border-[var(--card-border)] hover:bg-[var(--background)] transition-colors"
                                        >
                                            <td className="py-3 px-2 text-[var(--text-secondary)]">
                                                {format(time, 'HH:mm', { locale: ko })}
                                            </td>
                                            <td className="py-3 px-2 font-medium">
                                                {metadata?.menu_name || '알 수 없음'}
                                            </td>
                                            <td className="py-3 px-2 text-right">
                                                {metadata?.calories?.toLocaleString() || 0} kcal
                                            </td>
                                            <td className="py-3 px-2 text-right text-blue-400">
                                                {metadata?.carbohydrates?.toFixed(1) || 0}g
                                            </td>
                                            <td className="py-3 px-2 text-right text-green-400">
                                                {metadata?.protein?.toFixed(1) || 0}g
                                            </td>
                                            <td className="py-3 px-2 text-right text-yellow-400">
                                                {metadata?.fat?.toFixed(1) || 0}g
                                            </td>
                                            <td className="py-3 px-2 text-center text-xs text-[var(--text-secondary)]">
                                                {metadata?.pfc_ratio ?
                                                    `${metadata.pfc_ratio.protein}:${metadata.pfc_ratio.fat}:${metadata.pfc_ratio.carbs}`
                                                    : '-'}
                                            </td>
                                            <td className="py-3 px-2 text-center">
                                                {metadata?.image_url && (
                                                    <button
                                                        onClick={() => setSelectedImage(metadata.image_url!)}
                                                        className="relative w-12 h-12 rounded-lg overflow-hidden hover:ring-2 hover:ring-orange-500 transition-all"
                                                    >
                                                        <img
                                                            src={metadata.image_url}
                                                            alt={metadata.menu_name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </button>
                                                )}
                                            </td>
                                            <td className="py-3 px-2 text-center">
                                                <button
                                                    onClick={() => handleDelete(event.id)}
                                                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors group"
                                                    title="삭제"
                                                >
                                                    <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-400 transition-colors" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Image Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>
                    <img
                        src={selectedImage}
                        alt="Food"
                        className="max-w-full max-h-[90vh] rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    );
}
