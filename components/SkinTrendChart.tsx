'use client';

import { EventLog, SkinAnalysisMetadata } from '@/types';
import { format, parseISO } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SkinTrendChartProps {
    skinEvents: EventLog[];
}

export default function SkinTrendChart({ skinEvents }: SkinTrendChartProps) {
    if (!skinEvents || skinEvents.length < 2) return null;

    // Process data for chart
    // Sort by date ascending (oldest to newest)
    const sortedEvents = [...skinEvents].sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Take last 7 days (or last 7 entries)
    const recentEvents = sortedEvents.slice(-7);

    const data = recentEvents.map(event => {
        const metadata = event.metadata as SkinAnalysisMetadata;
        return {
            date: format(parseISO(event.timestamp), 'MM.dd'),
            score: metadata.scores.total_health_index,
            inflammation: metadata.lesion_counts.inflammatory
        };
    });

    // Calculate Trend
    const latest = data[data.length - 1];
    const previous = data[data.length - 2];
    const diff = latest.score - previous.score;

    let trendIcon = <Minus className="w-4 h-4 text-gray-400" />;
    let trendText = "변동 없음";
    let trendColor = "text-gray-400 font-medium";

    if (diff > 0) {
        trendIcon = <TrendingUp className="w-4 h-4 text-green-500" />;
        trendText = `+${diff}점 상승`;
        trendColor = "text-green-500 font-bold";
    } else if (diff < 0) {
        trendIcon = <TrendingDown className="w-4 h-4 text-red-500" />;
        trendText = `${diff}점 하락`;
        trendColor = "text-red-500 font-bold";
    }

    return (
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        📈 피부 컨디션 추이
                    </h2>
                    <p className="text-sm text-[var(--text-secondary)]">최근 7회 기록 변화</p>
                </div>
                <div className="text-right">
                    <div className={`flex items-center justify-end gap-1 ${trendColor}`}>
                        {trendIcon}
                        <span>{trendText}</span>
                    </div>
                </div>
            </div>

            <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--card-border)" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
                            axisLine={false}
                            tickLine={false}
                            dy={10}
                        />
                        <YAxis
                            yAxisId="left"
                            domain={[0, 100]}
                            hide={true}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            hide={true}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--card-bg)',
                                borderColor: 'var(--card-border)',
                                borderRadius: '12px',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                            itemStyle={{ fontSize: '12px' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="score"
                            name="피부 점수"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
                            activeDot={{ r: 6 }}
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="inflammation"
                            name="염증 개수"
                            stroke="#ef4444"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={{ r: 3, fill: '#ef4444' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
