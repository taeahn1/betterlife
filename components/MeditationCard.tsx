'use client';

import { EventLog } from '@/types';
import { Brain, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale/ko';
import { toZonedTime } from 'date-fns-tz';

interface MeditationCardProps {
    events: EventLog[];
}

export default function MeditationCard({ events }: MeditationCardProps) {
    const meditationEvents = events.filter(
        e => e.activity_type === 'MEDITATION_START' || e.activity_type === 'MEDITATION_END'
    );

    const totalSessions = meditationEvents.filter(e => e.activity_type === 'MEDITATION_START').length;

    return (
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 card-hover">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-500/10 rounded-xl">
                    <Brain className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold">명상 기록</h2>
                    <p className="text-sm text-[var(--text-secondary)]">
                        총 {totalSessions}회 세션
                    </p>
                </div>
            </div>

            {meditationEvents.length === 0 ? (
                <div className="text-center py-12">
                    <Brain className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-3 opacity-50" />
                    <p className="text-[var(--text-secondary)]">아직 명상 기록이 없습니다</p>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                        아이폰 단축어로 명상을 기록해보세요
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {meditationEvents.slice(0, 10).map((event) => (
                        <div
                            key={event.id}
                            className="flex items-center justify-between p-4 bg-[var(--background)] rounded-xl border border-[var(--card-border)] hover:border-purple-500/30 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500/10 rounded-lg">
                                    <Calendar className="w-4 h-4 text-purple-400" />
                                </div>
                                <div>
                                    <p className="font-medium">
                                        {event.activity_type === 'MEDITATION_START' ? '명상 시작' : '명상 종료'}
                                    </p>
                                    <p className="text-sm text-[var(--text-secondary)]">
                                        {format(toZonedTime(new Date(event.timestamp), 'Asia/Seoul'), 'PPP p', { locale: ko })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {event.activity_type === 'MEDITATION_START' && (
                                    <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-medium rounded-full">
                                        시작
                                    </span>
                                )}
                                {event.activity_type === 'MEDITATION_END' && (
                                    <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-medium rounded-full">
                                        종료
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
