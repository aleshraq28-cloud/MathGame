import { Link } from '@inertiajs/react';
import { Check, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { StageIcon } from '@/components/art/stage-icon';
import { TurtleGuide } from '@/components/art/turtle-guide';
import { StarRating } from '@/components/game/star-rating';
import { usePreferences } from '@/hooks/use-preferences';
import { cn } from '@/lib/utils';
import { show } from '@/routes/game/stages';
import type { MapStage } from '@/types';

const STATUS_LABEL: Record<MapStage['status'], string> = {
    locked: 'مقفلة',
    unlocked: 'مفتوحة',
    current: 'ابدأ هنا!',
    completed: 'مكتملة',
};

export function StageNode({
    stage,
    x,
    y,
    accent,
}: {
    stage: MapStage;
    x: number;
    y: number;
    accent: string;
}) {
    const { n, play } = usePreferences();
    const locked = stage.status === 'locked';
    const label = `المرحلة ${stage.stage_number}: ${stage.title} — ${STATUS_LABEL[stage.status]}${stage.status === 'completed' ? `، ${stage.stars} من 3 نجوم` : ''}`;

    const circle = (
        <span
            className={cn(
                'relative flex size-[76px] items-center justify-center rounded-full border-4 shadow-[0_6px_0_rgb(0_0_0_/_0.18)] transition-transform sm:size-[84px]',
                stage.is_final && 'size-[92px] sm:size-[100px]',
                locked && 'border-slate-300 bg-slate-200 text-slate-400',
                stage.status === 'completed' && 'border-sun-500 bg-white',
                (stage.status === 'unlocked' || stage.status === 'current') &&
                    'border-white bg-white',
                stage.status === 'current' && 'animate-pulse-ring',
                !locked && 'group-hover:-translate-y-1',
            )}
            style={!locked ? { color: accent } : undefined}
        >
            <StageIcon
                name={stage.icon}
                className={cn(
                    'size-9 sm:size-10',
                    stage.is_final && 'size-11 sm:size-12',
                )}
            />
            <span
                className={cn(
                    'absolute -start-1 -top-1 flex size-8 items-center justify-center rounded-full border-2 border-white text-sm font-extrabold text-white',
                    locked ? 'bg-slate-400' : 'bg-coral-500',
                )}
                aria-hidden="true"
            >
                {n(stage.stage_number)}
            </span>
            {locked && (
                <span
                    className="absolute -end-1 -bottom-1 flex size-8 items-center justify-center rounded-full border-2 border-white bg-slate-500 text-white"
                    aria-hidden="true"
                >
                    <Lock className="size-4" />
                </span>
            )}
            {stage.status === 'completed' && (
                <span
                    className="absolute -end-1 -bottom-1 flex size-8 items-center justify-center rounded-full border-2 border-white bg-leaf-500 text-white"
                    aria-hidden="true"
                >
                    <Check className="size-5" strokeWidth={3} />
                </span>
            )}
        </span>
    );

    const caption = (
        <span className="mt-1.5 flex w-36 flex-col items-center text-center sm:w-40">
            <span
                className={cn(
                    'rounded-xl px-2 py-0.5 text-[0.95rem] leading-snug font-bold sm:text-base',
                    locked
                        ? 'bg-white/60 text-slate-500'
                        : 'bg-white/85 text-slate-800',
                )}
            >
                {stage.title}
            </span>
            {stage.status === 'completed' ? (
                <StarRating value={stage.stars} size="sm" className="mt-0.5" />
            ) : (
                <span
                    className={cn(
                        'mt-0.5 text-sm font-bold',
                        locked ? 'text-slate-500' : 'text-coral-500',
                    )}
                >
                    {locked && (
                        <Lock
                            className="me-1 inline size-3.5"
                            aria-hidden="true"
                        />
                    )}
                    {STATUS_LABEL[stage.status]}
                </span>
            )}
        </span>
    );

    return (
        <div
            className="absolute flex -translate-x-1/2 -translate-y-[42px] flex-col items-center"
            style={{ left: x, top: y }}
        >
            {stage.status === 'current' && (
                <TurtleGuide className="pointer-events-none absolute -end-14 -top-1 z-10 h-14 animate-bob" />
            )}
            {locked ? (
                <button
                    type="button"
                    aria-disabled="true"
                    aria-label={label}
                    className="group flex flex-col items-center rounded-3xl"
                    onClick={() => {
                        play('click');
                        toast(
                            stage.is_final
                                ? 'أكمل كل المراحل لتفتح صندوق الكنز!'
                                : 'هذه المرحلة مقفلة. أكمل المرحلة السابقة لتفتحها.',
                        );
                    }}
                >
                    {circle}
                    {caption}
                </button>
            ) : (
                <Link
                    href={show.url(stage.slug)}
                    aria-label={label}
                    className="group flex flex-col items-center rounded-3xl"
                    onClick={() => play('click')}
                >
                    {circle}
                    {caption}
                </Link>
            )}
        </div>
    );
}
