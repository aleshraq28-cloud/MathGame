import { AchievementBadge } from '@/components/game/achievement-badge';
import { usePreferences } from '@/hooks/use-preferences';
import GameLayout from '@/layouts/game-layout';
import type { Achievement, Summary } from '@/types';

export default function Achievements({
    achievements,
    summary,
}: {
    achievements: Achievement[];
    summary: Summary;
}) {
    const { n } = usePreferences();
    const earned = achievements.filter((a) => a.earned);
    const locked = achievements.filter((a) => !a.earned);

    return (
        <GameLayout title="الأوسمة" summary={summary} current="achievements">
            <h1 className="text-3xl font-extrabold text-bark-800">أوسمتي</h1>
            <p className="mt-1 mb-5 text-lg text-slate-600">
                حصلت على {n(earned.length)} من {n(achievements.length)} أوسمة.
                أكمل المراحل واجمع النجوم لتربح المزيد!
            </p>

            {earned.length > 0 && (
                <section className="mb-6" aria-labelledby="earned">
                    <h2
                        id="earned"
                        className="mb-2 text-xl font-extrabold text-sun-500"
                    >
                        أوسمة حصلت عليها
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {earned.map((a) => (
                            <AchievementBadge key={a.key} achievement={a} />
                        ))}
                    </div>
                </section>
            )}

            {locked.length > 0 && (
                <section aria-labelledby="locked">
                    <h2
                        id="locked"
                        className="mb-2 text-xl font-extrabold text-slate-500"
                    >
                        أوسمة تنتظرك
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {locked.map((a) => (
                            <AchievementBadge
                                key={a.key}
                                achievement={a}
                                earned={false}
                            />
                        ))}
                    </div>
                </section>
            )}
        </GameLayout>
    );
}
