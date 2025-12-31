'use client';

import { Activity, Heart, Utensils, Moon, LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
    activity: Activity,
    heart: Heart,
    utensils: Utensils,
    moon: Moon,
};

interface StatsCardProps {
    title: string;
    description: string;
    iconName: string;
    iconColor: string;
    iconBgColor: string;
    count?: number;
    comingSoon?: boolean;
}

export default function StatsCard({
    title,
    description,
    iconName,
    iconColor,
    iconBgColor,
    count = 0,
    comingSoon = false,
}: StatsCardProps) {
    const Icon = iconMap[iconName];

    if (!Icon) {
        console.error(`Icon "${iconName}" not found in iconMap`);
        return null;
    }

    return (
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 card-hover relative overflow-hidden">
            {comingSoon && (
                <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 text-xs font-medium rounded-full">
                        Coming Soon
                    </span>
                </div>
            )}

            <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 ${iconBgColor} rounded-xl`}>
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
                <div>
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <p className="text-sm text-[var(--text-secondary)]">{description}</p>
                </div>
            </div>

            {!comingSoon && (
                <div className="mt-6">
                    <p className="text-3xl font-bold gradient-text">{count}</p>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">총 기록</p>
                </div>
            )}

            {comingSoon && (
                <div className="mt-6 text-center py-8">
                    <Icon className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-3 opacity-30" />
                    <p className="text-[var(--text-secondary)] text-sm">곧 추가될 기능입니다</p>
                </div>
            )}
        </div>
    );
}
