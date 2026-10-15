import { Head, Link, usePage } from '@inertiajs/react';
import { Award, Map as MapIcon, Star } from 'lucide-react';
import { useEffect } from 'react';
import { TreasureChest } from '@/components/art/treasure-chest';
import { TurtleGuide } from '@/components/art/turtle-guide';
import { AchievementBadge } from '@/components/game/achievement-badge';
import { Confetti } from '@/components/game/confetti';
import { StarRating } from '@/components/game/star-rating';
import { usePreferences } from '@/hooks/use-preferences';
import { achievements as achievementsRoute, map } from '@/routes/game';
import type { Achievement } from '@/types';
import type { ResultProps } from './results';

export default function Victory({
    result,
    summary,
    achievements,
}: ResultProps & { achievements: Achievement[] }) {
    const { n, play } = usePreferences();
    const { student } = usePage().props;

    useEffect(() => {
        play('win');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="relative min-h-dvh overflow-hidden bg-gradient-to-b from-berry-700 via-sea-700 to-sea-900 px-4 py-10 text-white">
            <Head title="لقد وجدت الكنز!" />
            <Confetti pieces={60} />
            <main className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
                <div className="relative">
                    <span
                        className="absolute inset-0 -z-10 m-auto size-56 rounded-full bg-sun-300/40 blur-3xl"
                        aria-hidden="true"
                    />
                    <TreasureChest open className="h-48 sm:h-60" />
                </div>
                <h1 className="mt-4 text-4xl font-extrabold text-sun-300 sm:text-5xl">
                    لقد وجدت الكنز!
                </h1>
                <p className="mt-2 text-2xl font-bold">
                    أحسنت يا بطل الرياضيات {student?.name}!
                </p>
                <p className="mt-1 text-lg text-sea-100">
                    أكملت كل مراحل الجزيرة وفتحت صندوق الكنز.
                </p>
                <StarRating
                    value={result.stars}
                    size="lg"
                    animate
                    className="mt-4"
                />

                <div className="mt-6 grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="rounded-3xl bg-white/15 p-4 backdrop-blur">
                        <Star
                            className="mx-auto size-8 fill-sun-400 text-sun-400"
                            aria-hidden="true"
                        />
                        <p className="text-3xl font-extrabold">
                            {n(`${summary.stars}/${summary.max_stars}`)}
                        </p>
                        <p className="font-bold text-sea-100">نجوم الرحلة</p>
                    </div>
                    <div className="rounded-3xl bg-white/15 p-4 backdrop-blur">
                        <MapIcon
                            className="mx-auto size-8 text-leaf-300"
                            aria-hidden="true"
                        />
                        <p className="text-3xl font-extrabold">
                            {n(
                                `${summary.completed_stages}/${summary.total_stages}`,
                            )}
                        </p>
                        <p className="font-bold text-sea-100">مراحل مكتملة</p>
                    </div>
                    <div className="col-span-2 rounded-3xl bg-white/15 p-4 backdrop-blur sm:col-span-1">
                        <Award
                            className="mx-auto size-8 text-coral-400"
                            aria-hidden="true"
                        />
                        <p className="text-3xl font-extrabold">
                            {n(summary.best_score_total)}
                        </p>
                        <p className="font-bold text-sea-100">
                            مجموع أفضل النقاط
                        </p>
                    </div>
                </div>

                {achievements.length > 0 && (
                    <section className="mt-8 w-full text-start">
                        <h2 className="mb-3 text-center text-2xl font-extrabold text-sun-300">
                            أوسمتك
                        </h2>
                        <div className="grid gap-3 text-slate-800 sm:grid-cols-2">
                            {achievements.map((a) => (
                                <AchievementBadge
                                    key={a.key}
                                    achievement={a}
                                    size="sm"
                                />
                            ))}
                        </div>
                    </section>
                )}

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link
                        href={map.url()}
                        className="game-btn h-14 bg-sun-400 text-xl text-bark-800"
                    >
                        <MapIcon className="size-5" aria-hidden="true" />
                        العودة إلى الخريطة
                    </Link>
                    <Link
                        href={achievementsRoute.url()}
                        className="game-btn h-14 bg-white text-xl text-berry-700"
                    >
                        <Award className="size-5" aria-hidden="true" />
                        كل الأوسمة
                    </Link>
                </div>
                <TurtleGuide className="mt-8 h-24 animate-float" mood="cheer" />
            </main>
        </div>
    );
}
