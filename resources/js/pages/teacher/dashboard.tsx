import { Link } from '@inertiajs/react';
import { BookOpen, Star, Trophy, Users } from 'lucide-react';
import TeacherLayout from '@/layouts/teacher-layout';
import { players } from '@/routes/teacher';
import { index as stagesIndex } from '@/routes/teacher/stages';

type Overview = {
    players: number;
    completed_stages: number;
    stars: number;
    treasure_found: number;
};

type Props = {
    overview: Overview;
    stages_count: number;
    active_stages: number;
    worlds: Record<number, { name: string; tagline: string; theme: string }>;
};

export default function TeacherDashboard({
    overview,
    stages_count,
    active_stages,
}: Props) {
    return (
        <TeacherLayout title="لوحة المعلمة" current="dashboard">
            <h1 className="text-3xl font-extrabold text-slate-800">
                نظرة عامة
            </h1>
            <p className="mt-1 text-slate-600">
                راقبي تقدّم اللاعبين وعدّلي المراحل والأسئلة من هنا.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Stat
                    icon={Users}
                    label="اللاعبون"
                    value={overview.players}
                    tone="sea"
                />
                <Stat
                    icon={BookOpen}
                    label="مراحل مكتملة (مجموع)"
                    value={overview.completed_stages}
                    tone="leaf"
                />
                <Stat
                    icon={Star}
                    label="النجوم"
                    value={overview.stars}
                    tone="sun"
                />
                <Stat
                    icon={Trophy}
                    label="وجدوا الكنز"
                    value={overview.treasure_found}
                    tone="coral"
                />
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
                <Link
                    href={players.url()}
                    className="rounded-3xl border-2 border-sea-200 bg-white p-6 shadow-sm transition hover:border-sea-400 hover:shadow-md"
                >
                    <Users className="size-8 text-sea-600" aria-hidden="true" />
                    <h2 className="mt-3 text-xl font-extrabold text-slate-800">
                        قائمة اللاعبين
                    </h2>
                    <p className="mt-1 text-slate-600">
                        الأسماء، النقاط، النجوم، والمرحلة الحالية لكل طالب.
                    </p>
                </Link>
                <Link
                    href={stagesIndex.url()}
                    className="rounded-3xl border-2 border-leaf-300 bg-white p-6 shadow-sm transition hover:border-leaf-500 hover:shadow-md"
                >
                    <BookOpen
                        className="size-8 text-leaf-600"
                        aria-hidden="true"
                    />
                    <h2 className="mt-3 text-xl font-extrabold text-slate-800">
                        المراحل والأسئلة
                    </h2>
                    <p className="mt-1 text-slate-600">
                        {active_stages} مرحلة نشطة من أصل {stages_count}. أضيفي
                        مراحل أو عدّلي الأسئلة والإجابات.
                    </p>
                </Link>
            </div>
        </TeacherLayout>
    );
}

function Stat({
    icon: Icon,
    label,
    value,
    tone,
}: {
    icon: typeof Users;
    label: string;
    value: number;
    tone: 'sea' | 'leaf' | 'sun' | 'coral';
}) {
    const tones = {
        sea: 'bg-sea-50 text-sea-700',
        leaf: 'bg-leaf-100 text-leaf-700',
        sun: 'bg-sun-300/40 text-bark-800',
        coral: 'bg-coral-400/15 text-coral-500',
    };

    return (
        <div className={`rounded-3xl p-5 ${tones[tone]}`}>
            <Icon className="size-6 opacity-80" aria-hidden="true" />
            <p className="mt-3 text-3xl font-extrabold">{value}</p>
            <p className="text-sm font-bold opacity-80">{label}</p>
        </div>
    );
}
