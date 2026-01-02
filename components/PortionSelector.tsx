'use client';

import { MealMetadata } from '@/types';
import { useState } from 'react';

interface PortionSelectorProps {
    eventId: string;
    currentPortion: number;
    metadata: MealMetadata;
    onUpdate: () => void;
}

const PORTION_OPTIONS = [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1.0];

export default function PortionSelector({ eventId, currentPortion, metadata, onUpdate }: PortionSelectorProps) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [selectedPortion, setSelectedPortion] = useState(currentPortion);

    const handlePortionChange = async (portion: number) => {
        setIsUpdating(true);
        setSelectedPortion(portion);

        try {
            const response = await fetch(`/api/events/${eventId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ portion_consumed: portion }),
            });

            if (!response.ok) throw new Error('Failed to update portion');

            onUpdate();
        } catch (error) {
            console.error('Error updating portion:', error);
            alert('섭취량 업데이트에 실패했습니다.');
            setSelectedPortion(currentPortion);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="mt-3 pt-3 border-t border-[var(--card-border)]">
            <div className="text-xs text-[var(--text-secondary)] mb-2">섭취량</div>
            <div className="flex flex-wrap gap-2">
                {PORTION_OPTIONS.map(portion => {
                    const isSelected = selectedPortion === portion;
                    const percentage = Math.round(portion * 100);

                    return (
                        <button
                            key={portion}
                            onClick={() => handlePortionChange(portion)}
                            disabled={isUpdating}
                            className={`
                                px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                                ${isSelected
                                    ? 'bg-green-500 text-white shadow-md'
                                    : 'bg-[var(--background)] text-[var(--text-secondary)] hover:bg-green-500/10 hover:text-green-500'
                                }
                                ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                            `}
                        >
                            {percentage}%
                        </button>
                    );
                })}
            </div>
            {selectedPortion < 1.0 && (
                <div className="mt-2 text-xs text-[var(--text-secondary)]">
                    실제 섭취: {Math.round(metadata.calories * selectedPortion)}kcal
                </div>
            )}
        </div>
    );
}
