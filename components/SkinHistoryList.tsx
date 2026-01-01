'use client';

import { EventLog, SkinAnalysisMetadata } from '@/types';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import SkinAnalysisModal from './SkinAnalysisModal';

interface SkinHistoryListProps {
    events: EventLog[];
}

export default function SkinHistoryList({ events }: SkinHistoryListProps) {
    const [showAll, setShowAll] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<EventLog | null>(null);

    if (events.length === 0) return null;

    const displayEvents = showAll ? events : events.slice(0, 5);
    const hasMore = events.length > 5;

    return (
        <>
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6">
                <h2 className="text-lg font-bold mb-4">📋 분석 기록</h2>
                <div className="space-y-3">
                    {displayEvents.map((event) => {
                        const metadata = event.metadata as SkinAnalysisMetadata;
                        return (
                            <div
                                key={event.id}
                                onClick={() => setSelectedEvent(event)}
                                className="flex items-center justify-between p-4 bg-[var(--background)] rounded-xl border border-[var(--card-border)] hover:border-purple-500/50 transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="text-2xl">
                                        {metadata.scores.status === 'Good' ? '✅' :
                                            metadata.scores.status === 'Warning' ? '⚠️' : '🚨'}
                                    </div>
                                    <div>
                                        <div className="font-medium">
                                            {new Date(event.timestamp).toLocaleDateString('ko-KR', {
                                                month: 'long',
                                                day: 'numeric',
                                                weekday: 'short'
                                            })}
                                        </div>
                                        <div className="text-sm text-[var(--text-secondary)]">
                                            {new Date(event.timestamp).toLocaleTimeString('ko-KR', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold gradient-text">
                                        {metadata.scores.total_health_index}
                                    </div>
                                    <div className="text-xs text-[var(--text-secondary)]">
                                        염증 {metadata.lesion_counts.inflammatory}개
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {hasMore && (
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="w-full mt-4 py-3 px-4 bg-[var(--background)] hover:bg-purple-500/10 border border-[var(--card-border)] hover:border-purple-500/50 rounded-xl transition-all flex items-center justify-center gap-2 font-medium"
                    >
                        {showAll ? (
                            <>
                                <ChevronUp className="w-4 h-4" />
                                접기
                            </>
                        ) : (
                            <>
                                <ChevronDown className="w-4 h-4" />
                                전체 기록 보기 ({events.length}개)
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Modal */}
            {selectedEvent && (
                <SkinAnalysisModal
                    analysis={selectedEvent.metadata as SkinAnalysisMetadata}
                    timestamp={selectedEvent.timestamp}
                    onClose={() => setSelectedEvent(null)}
                />
            )}
        </>
    );
}
