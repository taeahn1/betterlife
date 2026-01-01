'use client';

import { SkinAnalysisMetadata } from '@/types';
import { X } from 'lucide-react';
import { format } from 'date-fns';

interface SkinAnalysisModalProps {
    analysis: SkinAnalysisMetadata;
    timestamp: string;
    onClose: () => void;
}

export default function SkinAnalysisModal({ analysis, timestamp, onClose }: SkinAnalysisModalProps) {
    const { lesion_counts, spatial_mapping, asymmetry, post_acne, scores, image_urls } = analysis;

    const getStatusColor = (status: string) => {
        if (status === 'Good') return 'text-green-500 bg-green-500/10';
        if (status === 'Warning') return 'text-yellow-500 bg-yellow-500/10';
        return 'text-red-500 bg-red-500/10';
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-[var(--card-bg)] border-b border-[var(--card-border)] p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            🧬 피부 분석 상세
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(scores.status)}`}>
                                {scores.status}
                            </span>
                        </h2>
                        <p className="text-sm text-[var(--text-secondary)] mt-1">
                            {format(new Date(timestamp), 'yyyy년 MM월 dd일 HH:mm')}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[var(--card-border)] rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Score */}
                    <div className="text-center py-4 bg-[var(--background)] rounded-xl">
                        <div className="text-5xl font-bold gradient-text mb-2">
                            {scores.total_health_index}
                            <span className="text-2xl text-[var(--text-secondary)]">/100</span>
                        </div>
                        <div className="text-sm text-[var(--text-secondary)]">피부 건강 점수</div>
                    </div>

                    {/* Images */}
                    <div>
                        <h3 className="text-sm font-semibold mb-3 text-[var(--text-secondary)]">촬영 사진</h3>
                        <div className="grid grid-cols-3 gap-3">
                            {image_urls.left && (
                                <div className="relative aspect-[3/4] bg-black/10 rounded-lg overflow-hidden">
                                    <img src={image_urls.left} className="w-full h-full object-cover" alt="Left" />
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs text-center py-1">
                                        좌측
                                    </div>
                                </div>
                            )}
                            {image_urls.front && (
                                <div className="relative aspect-[3/4] bg-black/10 rounded-lg overflow-hidden">
                                    <img src={image_urls.front} className="w-full h-full object-cover" alt="Front" />
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs text-center py-1">
                                        정면
                                    </div>
                                </div>
                            )}
                            {image_urls.right && (
                                <div className="relative aspect-[3/4] bg-black/10 rounded-lg overflow-hidden">
                                    <img src={image_urls.right} className="w-full h-full object-cover" alt="Right" />
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs text-center py-1">
                                        우측
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Analysis Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Lesion Counts */}
                        <div className="bg-[var(--background)] p-4 rounded-xl">
                            <h3 className="text-sm font-semibold mb-3">🔍 병변 카운트</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-[var(--text-secondary)]">좁쌀/화이트헤드</span>
                                    <span className="font-medium">{lesion_counts.non_inflammatory}개</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-orange-500">염증성</span>
                                    <span className="font-medium">{lesion_counts.inflammatory}개</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-red-500 font-semibold">낭종/결절</span>
                                    <span className="font-bold text-red-500">{lesion_counts.cystic}개</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-[var(--card-border)]">
                                    <span className="text-[var(--text-secondary)]">5mm 이상 대형</span>
                                    <span className="font-medium">{lesion_counts.large_lesions}개</span>
                                </div>
                            </div>
                        </div>

                        {/* Spatial & Asymmetry */}
                        <div className="bg-[var(--background)] p-4 rounded-xl">
                            <h3 className="text-sm font-semibold mb-3">🗺️ 분포 & 비대칭</h3>
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
                                <div className="pt-2 border-t border-[var(--card-border)]">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-[var(--text-secondary)]">좌우 비대칭</span>
                                        <span className="font-bold">{asymmetry.diff_ratio.toFixed(1)}x</span>
                                    </div>
                                    {asymmetry.comment && (
                                        <p className="text-xs text-[var(--text-secondary)] bg-[var(--card-bg)] p-2 rounded mt-2">
                                            💡 {asymmetry.comment}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Post-Acne */}
                    <div className="bg-[var(--background)] p-4 rounded-xl">
                        <h3 className="text-sm font-semibold mb-3">🔖 흔적 & 흉터</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-[var(--text-secondary)]">색소침착</span>
                                <div className="text-2xl font-bold mt-1">{post_acne.pigmentation_count}개</div>
                            </div>
                            <div>
                                <span className="text-[var(--text-secondary)]">패인 흉터</span>
                                <div className="text-2xl font-bold mt-1">
                                    {post_acne.pitted_scars ? '있음' : '없음'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
