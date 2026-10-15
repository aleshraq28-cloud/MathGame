import { Link } from '@inertiajs/react';
import { ArrowRight, Star } from 'lucide-react';
import TeacherLayout from '@/layouts/teacher-layout';
import type { MapStage, Summary } from '@/types';
import { players } from '@/routes/teacher';

type Props = {
    student: {
        id: number;
        name: string;
        last_played_at: string | null;
    };
    summary: Summary;
    stages: MapStage[];
    recent_attempts: {
        id: number;
        stage_title: string | null;
        stage_number: number | null;
        score: number;
        max_score: number;
        stars: number;
        passed: boolean;
        completed_at: string | null;
        started_at: string;
    }[];
};

function formatDate(value: string | null): string {
    if (!value) {
        return '—';
    }

    return new Intl.DateTimeFormat('ar', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

const statusLabel: Record<MapStage['status'], string> = {
    completed: 'مكتملة',
    current: 'الحالية',
    unlocked: 'مفتوحة',
    locked: 'مقفلة',
};

export default function TeacherPlayer({
    student,
    summary,
    stages,
    recent_attempts,
}: Props) {
    return (
        <TeacherLayout title={student.name} current="players">
            <Link
                href={players.url()}
                className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-sea-700 hover:underline"
            >
                <ArrowRight className="size-4" aria-hidden="true" />
                العودة إلى القائمة
            </Link>

            <h1 className="text-3xl font-extrabold text-slate-800">
                {student.name}
            </h1>
            <p className="mt-1 text-slate-600">
                آخر لعب: {formatDate(student.last_played_at)}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Card
                    label="التقدّم"
                    value={`${summary.completed_stages}/${summary.total_stages}`}
                />
                <Card label="النسبة" value={`${summary.percent}%`} />
                <Card
                    label="النجوم"
                    value={`${summary.stars}/${summary.max_stars}`}
                />
                <Card
                    label="نقاط التدريب"
                    value={String(summary.practice_points)}
                />
            </div>

            <section className="mt-8">
                <h2 className="text-xl font-extrabold text-slate-800">
                    حالة المراحل
                </h2>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {stages.map((stage) => (
                        <div
                            key={stage.id}
                            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3"
                        >
                            <div>
                                <p className="font-bold text-slate-800">
                                    {stage.stage_number}. {stage.title}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {statusLabel[stage.status]}
                                </p>
                            </div>
                            <span className="inline-flex items-center gap-1 font-bold text-sun-500">
                                <Star
                                    className="size-4 fill-current"
                                    aria-hidden="true"
                                />
                                {stage.stars}
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mt-8">
                <h2 className="text-xl font-extrabold text-slate-800">
                    آخر المحاولات
                </h2>
                {recent_attempts.length === 0 ? (
                    <p className="mt-2 text-slate-500">لا توجد محاولات بعد.</p>
                ) : (
                    <div className="mt-3 overflow-x-auto rounded-3xl border border-slate-200 bg-white">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-50 text-slate-600">
                                <tr>
                                    <th className="px-4 py-3 text-start font-bold">
                                        المرحلة
                                    </th>
                                    <th className="px-4 py-3 text-start font-bold">
                                        النتيجة
                                    </th>
                                    <th className="px-4 py-3 text-start font-bold">
                                        النجوم
                                    </th>
                                    <th className="px-4 py-3 text-start font-bold">
                                        التاريخ
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {recent_attempts.map((attempt) => (
                                    <tr
                                        key={attempt.id}
                                        className="border-t border-slate-100"
                                    >
                                        <td className="px-4 py-3 font-bold text-slate-800">
                                            {attempt.stage_number}.{' '}
                                            {attempt.stage_title}
                                        </td>
                                        <td className="px-4 py-3">
                                            {attempt.completed_at
                                                ? `${attempt.score}/${attempt.max_score}`
                                                : 'جارٍ'}
                                            {attempt.passed && (
                                                <span className="ms-2 text-xs font-bold text-leaf-700">
                                                    ناجح
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {attempt.stars}
                                        </td>
                                        <td className="px-4 py-3 text-slate-500">
                                            {formatDate(
                                                attempt.completed_at ??
                                                    attempt.started_at,
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </TeacherLayout>
    );
}

function Card({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-sm font-bold text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-800">
                {value}
            </p>
        </div>
    );
}
