import { Link } from '@inertiajs/react';
import {
    Award,
    CheckCircle2,
    Lock,
    Map as MapIcon,
    PlayCircle,
    Star,
    Trophy,
} from 'lucide-react';
import { StageIcon } from '@/components/art/stage-icon';
import { WORLD_THEMES } from '@/components/art/world-scenery';
import { StarRating } from '@/components/game/star-rating';
import { usePreferences } from '@/hooks/use-preferences';
import GameLayout from '@/layouts/game-layout';
import { cn } from '@/lib/utils';
import { achievements } from '@/routes/game';
import { show } from '@/routes/game/stages';
import type { MapStage, Summary, Worlds } from '@/types';

const STATUS = {
    completed: {
        label: 'مكتملة',
        className: 'bg-leaf-100 text-leaf-700',
        Icon: CheckCircle2,
    },
    current: {
        label: 'التالية',
        className: 'bg-sun-300 text-bark-800',
        Icon: PlayCircle,
    },
    unlocked: {
        label: 'مفتوحة',
        className: 'bg-sea-100 text-sea-700',
        Icon: PlayCircle,
    },
    locked: {
        label: 'مقفلة',
        className: 'bg-slate-100 text-slate-500',
        Icon: Lock,
    },
} as const;

export default function Progress({
    stages,
    worlds,
    summary,
    achievement_count,
}: {
    stages: MapStage[];
    worlds: Worlds;
    summary: Summary;
    achievement_count: number;
}) {
    const { n } = usePreferences();

    const cards = [
        {
            label: 'مراحل مكتملة',
            value: n(`${summary.completed_stages}/${summary.total_stages}`),
            Icon: MapIcon,
            tone: 'text-leaf-700 bg-leaf-100',
        },
        {
            label: 'النجوم',
            value: n(`${summary.stars}/${summary.max_stars}`),
            Icon: Star,
            tone: 'text-bark-800 bg-sun-300/50',
        },
        {
            label: 'مجموع أفضل النقاط',
            value: n(summary.best_score_total),
            Icon: Trophy,
            tone: 'text-coral-500 bg-coral-400/15',
        },
        {
            label: 'الأوسمة',
            value: n(achievement_count),
            Icon: Award,
            tone: 'text-berry-700 bg-berry-400/20',
        },
    ];

    return (
        <GameLayout title="تقدّمي" summary={summary} current="progress">
            <h1 className="mb-4 text-3xl font-extrabold text-bark-800">
                تقدّمي في الرحلة
            </h1>

            <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {cards.map(({ label, value, Icon, tone }) => (
                    <div
                        key={label}
                        className={cn(
                            'flex items-center gap-3 rounded-3xl p-4',
                            tone,
                        )}
                    >
                        <Icon className="size-9 shrink-0" aria-hidden="true" />
                        <div>
                            <p className="text-2xl font-extrabold">{value}</p>
                            <p className="text-sm font-bold">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mb-6 rounded-3xl bg-white p-4 shadow-sm">
                <div className="mb-2 flex justify-between text-lg font-bold text-slate-700">
                    <span>الطريق إلى الكنز</span>
                    <span>{n(summary.percent)}٪</span>
                </div>
                <div
                    className="h-5 overflow-hidden rounded-full bg-sand-100"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={summary.percent}
                    aria-label="نسبة إكمال الرحلة"
                >
                    <div
                        className="h-full rounded-full bg-gradient-to-l from-leaf-500 to-sea-500"
                        style={{ width: `${summary.percent}%` }}
                    />
                </div>
                <p className="mt-2 text-base text-slate-600">
                    مجموع نقاط التدريب في كل المحاولات:{' '}
                    {n(summary.practice_points)} ·{' '}
                    <Link
                        href={achievements.url()}
                        className="font-bold text-berry-700 underline underline-offset-4"
                    >
                        شاهد أوسمتك
                    </Link>
                </p>
            </div>

            <div className="flex flex-col gap-6">
                {Object.entries(worlds).map(([number, world]) => {
                    const list = stages.filter(
                        (s) => s.world_number === Number(number),
                    );
                    const theme =
                        WORLD_THEMES[world.theme] ?? WORLD_THEMES.forest;

                    if (list.length === 0) {
                        return null;
                    }

                    return (
                        <section key={number} aria-labelledby={`pw-${number}`}>
                            <h2
                                id={`pw-${number}`}
                                className={cn(
                                    'mb-2 text-xl font-extrabold',
                                    theme.header,
                                )}
                            >
                                {world.name}
                            </h2>
                            <ul className="grid gap-2 md:grid-cols-2">
                                {list.map((stage) => {
                                    const status = STATUS[stage.status];
                                    const content = (
                                        <>
                                            <span
                                                className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm"
                                                style={{
                                                    color:
                                                        stage.status ===
                                                        'locked'
                                                            ? '#94a3b8'
                                                            : theme.path,
                                                }}
                                            >
                                                <StageIcon
                                                    name={stage.icon}
                                                    className="size-7"
                                                />
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-lg font-extrabold text-slate-800">
                                                    {n(stage.stage_number)}.{' '}
                                                    {stage.title}
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    {stage.attempts > 0
                                                        ? `المحاولات: ${n(stage.attempts)} · أفضل نتيجة: ${n(stage.best_score)}`
                                                        : stage.topic}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span
                                                    className={cn(
                                                        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-bold',
                                                        status.className,
                                                    )}
                                                >
                                                    <status.Icon
                                                        className="size-4"
                                                        aria-hidden="true"
                                                    />
                                                    {status.label}
                                                </span>
                                                {stage.status ===
                                                    'completed' && (
                                                    <StarRating
                                                        value={stage.stars}
                                                        size="sm"
                                                    />
                                                )}
                                            </div>
                                        </>
                                    );

                                    return (
                                        <li key={stage.id}>
                                            {stage.status === 'locked' ? (
                                                <div className="flex items-center gap-3 rounded-3xl border-2 border-slate-200 bg-slate-50 p-3 opacity-75">
                                                    {content}
                                                </div>
                                            ) : (
                                                <Link
                                                    href={show.url(stage.slug)}
                                                    className="flex items-center gap-3 rounded-3xl border-2 border-white bg-white/90 p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                                                >
                                                    {content}
                                                </Link>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>
                    );
                })}
            </div>
        </GameLayout>
    );
}
