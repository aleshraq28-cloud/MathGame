import {
    Award,
    Footprints,
    Gem,
    Lock,
    Map as MapIcon,
    Mountain,
    Sparkles,
    Star,
    Stars,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Achievement } from '@/types';

const ICONS: Record<string, LucideIcon> = {
    footprints: Footprints,
    sparkles: Sparkles,
    mountain: Mountain,
    star: Star,
    stars: Stars,
    map: MapIcon,
    gem: Gem,
    award: Award,
};

export function AchievementBadge({
    achievement,
    earned = true,
    size = 'md',
    className,
}: {
    achievement: Achievement;
    earned?: boolean;
    size?: 'sm' | 'md';
    className?: string;
}) {
    const Icon = ICONS[achievement.icon] ?? Award;

    return (
        <div
            className={cn(
                'flex items-center gap-3 rounded-3xl border-4 p-3',
                earned
                    ? 'border-sun-400 bg-white'
                    : 'border-slate-200 bg-slate-50',
                className,
            )}
        >
            <span
                className={cn(
                    'relative flex shrink-0 items-center justify-center rounded-full',
                    size === 'sm' ? 'size-12' : 'size-16',
                    earned
                        ? 'shine-gold text-white shadow-md'
                        : 'bg-slate-200 text-slate-400',
                )}
            >
                <Icon
                    className={size === 'sm' ? 'size-6' : 'size-8'}
                    aria-hidden="true"
                />
                {!earned && (
                    <span className="absolute -end-1 -bottom-1 flex size-6 items-center justify-center rounded-full bg-slate-400 text-white">
                        <Lock className="size-3.5" aria-hidden="true" />
                    </span>
                )}
            </span>
            <div className="min-w-0">
                <p
                    className={cn(
                        'text-lg leading-tight font-extrabold',
                        earned ? 'text-bark-800' : 'text-slate-500',
                    )}
                >
                    {achievement.title}
                </p>
                <p
                    className={cn(
                        'text-sm',
                        earned ? 'text-slate-600' : 'text-slate-400',
                    )}
                >
                    {achievement.description}
                </p>
                {!earned && <span className="sr-only">لم تحصل عليه بعد</span>}
            </div>
        </div>
    );
}
