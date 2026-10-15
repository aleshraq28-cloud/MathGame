import { Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    Lightbulb,
    Map as MapIcon,
    RotateCcw,
    Sparkles,
    Trophy,
    XCircle,
} from 'lucide-react';
import { useEffect } from 'react';
import { TurtleGuide } from '@/components/art/turtle-guide';
import { AchievementBadge } from '@/components/game/achievement-badge';
import { Confetti } from '@/components/game/confetti';
import { StarRating } from '@/components/game/star-rating';
import { usePreferences } from '@/hooks/use-preferences';
import GameLayout from '@/layouts/game-layout';
import { map } from '@/routes/game';
import { show, start } from '@/routes/game/stages';
import type { Achievement, StageCard, Summary } from '@/types';

export type ResultProps = {
    stage: StageCard;
    result: {
        attempt_id: number;
        score: number;
        max_score: number;
        correct: number;
        mistakes: number;
        total: number;
        hints_used: number;
        stars: number;
        passed: boolean;
        perfect: boolean;
        pass_mark: number;
        completion_bonus: number;
    };
    best: { score: number; stars: number };
    flags: { newly_completed: boolean; improved: boolean };
    next_stage: StageCard | null;
    new_achievements: Achievement[];
    summary: Summary;
};

function Stat({
    icon,
    label,
    value,
    tone,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    tone: string;
}) {
    return (
        <div
            className={`flex flex-col items-center gap-1 rounded-2xl p-3 ${tone}`}
        >
            {icon}
            <span className="text-2xl font-extrabold">{value}</span>
            <span className="text-sm font-bold">{label}</span>
        </div>
    );
}

export default function Results({
    stage,
    result,
    best,
    flags,
    next_stage,
    new_achievements,
    summary,
}: ResultProps) {
    const { n, play } = usePreferences();

    useEffect(() => {
        play(result.passed ? 'win' : 'click');
        // Only celebrate once when the page opens.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <GameLayout
            title={result.passed ? 'أحسنت يا بطل!' : 'نتيجة المرحلة'}
            summary={summary}
        >
            {result.passed && <Confetti />}
            <article className="mx-auto max-w-2xl animate-pop overflow-hidden rounded-[2rem] border-4 border-white bg-white/95 text-center shadow-2xl">
                <div
                    className={
                        result.passed
                            ? 'bg-gradient-to-b from-sun-300 to-sand-100 px-5 pt-6 pb-4'
                            : 'bg-gradient-to-b from-sea-100 to-sand-50 px-5 pt-6 pb-4'
                    }
                >
                    <TurtleGuide
                        className="mx-auto h-24 animate-bob"
                        mood={result.passed ? 'cheer' : 'thinking'}
                    />
                    {result.passed ? (
                        <>
                            <h1 className="mt-2 text-4xl font-extrabold text-bark-800">
                                أحسنت يا بطل!
                            </h1>
                            <p className="mt-1 text-xl font-bold text-bark-600">
                                لقد أكملت المرحلة بنجاح.
                            </p>
                        </>
                    ) : (
                        <>
                            <h1 className="mt-2 text-3xl font-extrabold text-sea-700">
                                محاولة جميلة!
                            </h1>
                            <p className="mt-1 text-lg font-bold text-slate-600">
                                تحتاج إلى {n(result.pass_mark)} إجابات صحيحة على
                                الأقل لتفتح المرحلة التالية. تدرّب قليلاً وحاول مرة
                                أخرى!
                            </p>
                        </>
                    )}
                    <p className="mt-2 text-lg font-semibold text-slate-600">
                        {stage.title}
                    </p>
                    <StarRating
                        value={result.stars}
                        size="lg"
                        animate
                        className="mt-3"
                    />
                    {result.perfect && (
                        <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-berry-500 px-4 py-1 text-base font-bold text-white">
                            <Sparkles className="size-5" aria-hidden="true" />
                            مرحلة مثالية!
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">
                    <Stat
                        icon={<Trophy className="size-7" aria-hidden="true" />}
                        label="النقاط"
                        value={n(result.score)}
                        tone="bg-sun-300/40 text-bark-800"
                    />
                    <Stat
                        icon={
                            <CheckCircle2
                                className="size-7"
                                aria-hidden="true"
                            />
                        }
                        label="إجابات صحيحة"
                        value={n(`${result.correct}/${result.total}`)}
                        tone="bg-leaf-100 text-leaf-700"
                    />
                    <Stat
                        icon={<XCircle className="size-7" aria-hidden="true" />}
                        label="محاولات خاطئة"
                        value={n(result.mistakes)}
                        tone="bg-coral-400/15 text-coral-500"
                    />
                    <Stat
                        icon={
                            <Lightbulb className="size-7" aria-hidden="true" />
                        }
                        label="تلميحات"
                        value={n(result.hints_used)}
                        tone="bg-sea-100 text-sea-700"
                    />
                </div>

                <div className="mx-5 mb-5 rounded-2xl bg-sand-100 px-4 py-3 text-base font-semibold text-bark-800">
                    {result.completion_bonus > 0 && (
                        <p>
                            تشمل النقاط مكافأة إكمال المرحلة:{' '}
                            {n(result.completion_bonus)} نقطة.
                        </p>
                    )}
                    <p>
                        أفضل نتيجة لك في هذه المرحلة: {n(best.score)} نقطة و
                        {n(best.stars)} {best.stars === 1 ? 'نجمة' : 'نجوم'}.
                    </p>
                    {flags.improved && (
                        <p className="text-leaf-700">
                            رائع! حسّنت أفضل نتيجة لك!
                        </p>
                    )}
                    {flags.newly_completed && next_stage && (
                        <p className="text-leaf-700">
                            فُتحت مرحلة جديدة: {next_stage.title}!
                        </p>
                    )}
                </div>

                {new_achievements.length > 0 && (
                    <section className="mx-5 mb-5 text-start">
                        <h2 className="mb-2 text-center text-xl font-extrabold text-berry-700">
                            أوسمة جديدة!
                        </h2>
                        <div className="grid gap-2">
                            {new_achievements.map((a) => (
                                <AchievementBadge
                                    key={a.key}
                                    achievement={a}
                                    size="sm"
                                    className="animate-pop"
                                />
                            ))}
                        </div>
                    </section>
                )}

                <div className="flex flex-col gap-3 border-t-4 border-sand-100 p-5 sm:flex-row sm:justify-center">
                    {next_stage && (
                        <Link
                            href={show.url(next_stage.slug)}
                            className="game-btn h-14 bg-leaf-500 text-xl text-white hover:bg-leaf-700"
                        >
                            المرحلة التالية
                            <ArrowLeft className="size-6" aria-hidden="true" />
                        </Link>
                    )}
                    <button
                        type="button"
                        onClick={() => router.post(start.url(stage.slug))}
                        className="game-btn h-14 bg-sun-400 text-xl text-bark-800 hover:bg-sun-300"
                    >
                        <RotateCcw className="size-5" aria-hidden="true" />
                        {result.passed ? 'العب مرة أخرى' : 'حاول مرة أخرى'}
                    </button>
                    <Link
                        href={map.url()}
                        className="game-btn h-14 bg-white text-xl text-sea-700 ring-2 ring-sea-100"
                    >
                        <MapIcon className="size-5" aria-hidden="true" />
                        الخريطة
                    </Link>
                </div>
            </article>
        </GameLayout>
    );
}
