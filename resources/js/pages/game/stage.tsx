import { Link, router } from '@inertiajs/react';
import {
    ArrowRight,
    Lightbulb,
    LoaderCircle,
    Play,
    RotateCcw,
    Target,
} from 'lucide-react';
import { useState } from 'react';
import { StageIcon } from '@/components/art/stage-icon';
import { GuideBubble } from '@/components/art/turtle-guide';
import { WORLD_THEMES } from '@/components/art/world-scenery';
import { MathText } from '@/components/game/math-text';
import { StarRating } from '@/components/game/star-rating';
import { usePreferences } from '@/hooks/use-preferences';
import GameLayout from '@/layouts/game-layout';
import { cn } from '@/lib/utils';
import { map } from '@/routes/game';
import { start } from '@/routes/game/stages';
import type { Rules, StageCard, Summary, World } from '@/types';

type Props = {
    stage: StageCard & { instructions: string; questions_per_attempt: number };
    world: World | null;
    progress: {
        status: 'new' | 'in_progress' | 'completed';
        best_score: number;
        stars: number;
        attempts: number;
        completed_at: string | null;
    };
    has_open_attempt: boolean;
    rules: Rules;
    summary: Summary;
};

export default function StagePage({
    stage,
    world,
    progress,
    has_open_attempt,
    rules,
    summary,
}: Props) {
    const { n, play } = usePreferences();
    const [starting, setStarting] = useState(false);
    const theme = WORLD_THEMES[world?.theme ?? 'forest'] ?? WORLD_THEMES.forest;
    const completed = progress.status === 'completed';

    const begin = () => {
        play('click');
        router.post(
            start.url(stage.slug),
            {},
            {
                onStart: () => setStarting(true),
                onFinish: () => setStarting(false),
            },
        );
    };

    return (
        <GameLayout title={stage.title} summary={summary}>
            <Link
                href={map.url()}
                className="mb-4 inline-flex items-center gap-1.5 rounded-xl px-2 py-1 text-lg font-bold text-sea-700 hover:bg-sea-100"
            >
                <ArrowRight className="size-5" aria-hidden="true" />
                العودة إلى الخريطة
            </Link>

            <article
                className={cn(
                    'relative overflow-hidden rounded-[2rem] border-4 border-white shadow-xl',
                    theme.panel,
                )}
            >
                <div className="grid gap-6 p-5 sm:p-8 md:grid-cols-[auto_1fr] md:items-center">
                    <div className="flex justify-center">
                        <span
                            className={cn(
                                'flex size-32 items-center justify-center rounded-full border-8 border-white bg-white shadow-lg sm:size-40',
                                stage.is_final && 'shine-gold text-white',
                            )}
                            style={{
                                color: stage.is_final ? undefined : theme.path,
                            }}
                        >
                            <StageIcon
                                name={stage.icon}
                                className="size-16 sm:size-20"
                            />
                        </span>
                    </div>
                    <div className="text-center md:text-start">
                        <p className={cn('text-lg font-bold', theme.header)}>
                            {world?.name} · المرحلة {n(stage.stage_number)}
                        </p>
                        <h1 className="mt-1 text-3xl font-extrabold text-slate-800 sm:text-4xl">
                            {stage.title}
                        </h1>
                        <p className="mt-2 text-lg text-slate-700">
                            <MathText>{stage.description}</MathText>
                        </p>
                        {completed && (
                            <div className="mt-3 inline-flex flex-wrap items-center gap-3 rounded-2xl bg-white/80 px-4 py-2">
                                <StarRating value={progress.stars} />
                                <span className="font-bold text-slate-700">
                                    أفضل نتيجة: {n(progress.best_score)} نقطة
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 bg-white/75 p-5 sm:p-8 md:grid-cols-2">
                    <section className="rounded-3xl bg-white p-4 shadow-sm">
                        <h2 className="mb-2 flex items-center gap-2 text-xl font-extrabold text-sea-700">
                            <Target className="size-6" aria-hidden="true" />
                            مهمتك
                        </h2>
                        <p className="text-lg leading-relaxed text-slate-700">
                            <MathText>{stage.instructions}</MathText>
                        </p>
                        <p className="mt-2 text-base font-semibold text-slate-500">
                            عدد الأسئلة: {n(stage.questions_per_attempt)} · لا
                            يوجد وقت محدّد، خذ وقتك!
                        </p>
                    </section>
                    <section className="rounded-3xl bg-white p-4 shadow-sm">
                        <h2 className="mb-2 flex items-center gap-2 text-xl font-extrabold text-sun-500">
                            <Lightbulb className="size-6" aria-hidden="true" />
                            كيف تجمع النقاط؟
                        </h2>
                        <ul className="space-y-1 text-base text-slate-700">
                            <li>
                                إجابة صحيحة من أول مرة: {n(rules.first_try)}{' '}
                                نقاط
                            </li>
                            <li>
                                من أول مرة بعد التلميح: {n(rules.after_hint)}{' '}
                                نقاط
                            </li>
                            <li>
                                من المحاولة الثانية: {n(rules.second_try)} نقاط،
                                والثالثة: {n(rules.third_try)}
                            </li>
                            <li>
                                أجب إجابة صحيحة عن {n(rules.pass_percent)}٪ من
                                الأسئلة لتنجح وتربح {n(rules.completion_bonus)}{' '}
                                نقطة إضافية.
                            </li>
                        </ul>
                    </section>
                </div>

                <div className="flex flex-col items-center gap-4 p-5 sm:flex-row sm:justify-between sm:p-8">
                    <GuideBubble mood={completed ? 'cheer' : 'happy'}>
                        {has_open_attempt
                            ? 'لديك محاولة لم تكتمل، هيا نكملها من حيث توقفت!'
                            : completed
                              ? 'أحسنت سابقاً! هل تستطيع جمع نجوم أكثر؟'
                              : 'أنا متحمسة! هل أنت مستعد؟'}
                    </GuideBubble>
                    <button
                        type="button"
                        onClick={begin}
                        disabled={starting}
                        className="game-btn h-16 min-w-56 bg-leaf-500 text-2xl text-white hover:bg-leaf-700"
                    >
                        {starting ? (
                            <LoaderCircle
                                className="size-6 animate-spin"
                                aria-hidden="true"
                            />
                        ) : completed && !has_open_attempt ? (
                            <RotateCcw className="size-6" aria-hidden="true" />
                        ) : (
                            <Play
                                className="size-6 fill-current"
                                aria-hidden="true"
                            />
                        )}
                        {has_open_attempt
                            ? 'تابع المرحلة'
                            : completed
                              ? 'العب مرة أخرى'
                              : 'ابدأ المرحلة'}
                    </button>
                </div>
            </article>
        </GameLayout>
    );
}
