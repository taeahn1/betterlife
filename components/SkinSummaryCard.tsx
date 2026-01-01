'use client';

import { SkinAnalysisMetadata } from '@/types';
import { ChevronRight, Activity } from 'lucide-react';
import Link from 'next/link';

interface SkinSummaryCardProps {
    latestAnalysis: SkinAnalysisMetadata | null;
}

export default function SkinSummaryCard({ latestAnalysis }: SkinSummaryCardProps) {
    if (!latestAnalysis) {
        return (
            <Link href="/skin">
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 mb-6 hover:border-purple-500/50 transition-all cursor-pointer group">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-purple-500/10 rounded-xl">
                                <Activity className="w-6 h-6 text-purple-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold">피부 분석</h3>
                                <p className="text-sm text-[var(--text-secondary)]">아직 기록이 없습니다</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-purple-500 transition-colors" />
                    </div>
                </div>
            </Link>
        );
    }

    const { scores } = latestAnalysis;
    const getStatusColor = (status: string) => {
        if (status === 'Good') return 'text-green-500 bg-green-500/10';
        if (status === 'Warning') return 'text-yellow-500 bg-yellow-500/10';
        return 'text-red-500 bg-red-500/10';
    };

    return (
        <Link href="/skin">
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 mb-6 hover:border-purple-500/50 transition-all cursor-pointer group">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/10 rounded-xl">
                            <Activity className="w-6 h-6 text-purple-500" />
                        </div>
                        <div>
                            <h3 className="font-semibold mb-1">피부 건강 점수</h3>
                            <div className="flex items-center gap-3">
                                <span className="text-3xl font-bold gradient-text">
                                    {scores.total_health_index}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(scores.status)}`}>
                                    {scores.status}
                                </span>
                            </div>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-purple-500 transition-colors" />
                </div>
            </div>
        </Link>
    );
}
