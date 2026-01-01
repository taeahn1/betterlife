import { queryEvents } from '@/lib/db';
import SkinDashboard from '@/components/SkinDashboard';
import SkinTrendChart from '@/components/SkinTrendChart';
import { SkinAnalysisMetadata } from '@/types';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SkinPage() {
    const events = await queryEvents({});

    const skinAnalysisEvents = events
        .filter(e => e.activity_type === 'SKIN_CHECK')
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return (
        <main className="min-h-screen bg-[var(--background)]">
            {/* Header */}
            <header className="border-b border-[var(--card-border)] bg-[var(--card-bg)]/50 backdrop-blur-xl sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="p-2 hover:bg-[var(--card-border)] rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold gradient-text">🧬 피부 정밀 분석</h1>
                            <p className="text-[var(--text-secondary)] mt-1">
                                AI 기반 5-Point 피부 건강 트래킹
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {skinAnalysisEvents.length === 0 ? (
                    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-12 text-center">
                        <div className="text-6xl mb-4">🔬</div>
                        <h2 className="text-2xl font-bold mb-2">아직 분석 기록이 없습니다</h2>
                        <p className="text-[var(--text-secondary)] mb-6">
                            iPhone 단축어로 얼굴 사진 3장(좌/정/우)을 촬영하여 분석을 시작하세요.
                        </p>
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 max-w-md mx-auto">
                            <p className="text-sm text-[var(--text-secondary)]">
                                💡 <strong>Tip:</strong> 매일 같은 시간, 같은 조명에서 촬영하면 더 정확한 추세 분석이 가능합니다.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Latest Analysis Dashboard */}
                        <SkinDashboard latestAnalysis={skinAnalysisEvents[0].metadata as SkinAnalysisMetadata} />

                        {/* Trend Chart */}
                        {skinAnalysisEvents.length >= 2 && (
                            <SkinTrendChart skinEvents={skinAnalysisEvents} />
                        )}

                        {/* Historical Records */}
                        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6">
                            <h2 className="text-lg font-bold mb-4">📋 분석 기록</h2>
                            <div className="space-y-3">
                                {skinAnalysisEvents.slice(1, 6).map((event, idx) => {
                                    const metadata = event.metadata as SkinAnalysisMetadata;
                                    return (
                                        <div
                                            key={event.id}
                                            className="flex items-center justify-between p-4 bg-[var(--background)] rounded-xl border border-[var(--card-border)] hover:border-purple-500/50 transition-colors"
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
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}
