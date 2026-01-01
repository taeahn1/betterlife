'use client';

import { SkinAnalysisMetadata, EventLog } from '@/types';
import { format } from 'date-fns';
import { Activity, AlertTriangle, CheckCircle, Search, Map } from 'lucide-react';

interface SkinDashboardProps {
    latestAnalysis: SkinAnalysisMetadata | null;
}

export default function SkinDashboard({ latestAnalysis }: SkinDashboardProps) {
    if (!latestAnalysis) return null;

    const { lesion_counts, spatial_mapping, asymmetry, post_acne, scores } = latestAnalysis;

    // Status Color Logic
    const getStatusColor = (status: string) => {
        if (status === 'Good') return 'text-green-500 bg-green-500/10';
        if (status === 'Warning') return 'text-yellow-500 bg-yellow-500/10';
        return 'text-red-500 bg-red-500/10';
    };

    const statusStyle = getStatusColor(scores.status);

    return (
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 mb-8">
            {/* Header with Integrated Score */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
                        🧬 피부 정밀 분석
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusStyle}`}>
                            {scores.status}
                        </span>
                    </h2>
                    <p className="text-[var(--text-secondary)] text-sm">
                        {format(new Date(latestAnalysis.analysis_date), 'yyyy.MM.dd HH:mm')} 분석
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-4xl font-bold gradient-text">
                        {scores.total_health_index}
                        <span className="text-lg text-[var(--text-secondary)]">/100</span>
                    </div>
                </div>
            </div>

            {/* 3 Images Grid */}
            <div className="grid grid-cols-3 gap-2 mb-8">
                {latestAnalysis.image_urls.left && (
                    <div className="aspect-[4/5] bg-black/10 rounded-lg overflow-hidden">
                        <img src={latestAnalysis.image_urls.left} className="w-full h-full object-cover" alt="Left" />
                        <div className="text-xs text-center py-1 bg-black/50 text-white absolute bottom-0 w-full">Left</div>
                    </div>
                )}
                {latestAnalysis.image_urls.front && (
                    <div className="aspect-[4/5] bg-black/10 rounded-lg overflow-hidden">
                        <img src={latestAnalysis.image_urls.front} className="w-full h-full object-cover" alt="Front" />
                    </div>
                )}
                {latestAnalysis.image_urls.right && (
                    <div className="aspect-[4/5] bg-black/10 rounded-lg overflow-hidden">
                        <img src={latestAnalysis.image_urls.right} className="w-full h-full object-cover" alt="Right" />
                    </div>
                )}
            </div>

            {/* 4-Grid Analysis Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* 1. Hard Count */}
                <div className="bg-[var(--background)] p-4 rounded-xl border border-[var(--card-border)]">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Search className="w-4 h-4 text-blue-500" /> 병변 카운트
                    </h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-[var(--text-secondary)]">좁쌀/화이트헤드</span>
                            <span className="font-medium">{lesion_counts.non_inflammatory}개</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-orange-500">염증성 (주의)</span>
                            <span className="font-medium">{lesion_counts.inflammatory}개</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-red-500 font-semibold">낭종/결절 (위험)</span>
                            <span className="font-bold text-red-500">{lesion_counts.cystic}개</span>
                        </div>
                    </div>
                </div>

                {/* 2. Spatial & Asymmetry */}
                <div className="bg-[var(--background)] p-4 rounded-xl border border-[var(--card-border)]">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Map className="w-4 h-4 text-purple-500" /> 분포 & 비대칭
                    </h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-[var(--text-secondary)]">주요 분포</span>
                            <span className="font-medium">{spatial_mapping.primary_locations.join(', ')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[var(--text-secondary)]">패턴</span>
                            <span className={`font-medium ${spatial_mapping.distribution_pattern === 'Clustered' ? 'text-red-400' : 'text-green-400'}`}>
                                {spatial_mapping.distribution_pattern}
                            </span>
                        </div>
                        <div className="pt-2 border-t border-[var(--card-border)] mt-2">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-[var(--text-secondary)]">좌우 비대칭 (R/L Ratio)</span>
                                <span className="font-bold">{asymmetry.diff_ratio.toFixed(1)}x</span>
                            </div>
                            {asymmetry.comment && (
                                <p className="text-xs text-[var(--text-secondary)] mt-1 bg-[var(--card-bg)] p-2 rounded">
                                    💡 {asymmetry.comment}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            {/* Risk Warnings */}
            {(lesion_counts.cystic > 0 || scores.status === 'Danger') && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-bold text-red-500">집중 관리 필요</h4>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">
                            낭종성 병변이 발견되었습니다. 무리한 압출을 피하고 전문가 상담을 권장합니다.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
