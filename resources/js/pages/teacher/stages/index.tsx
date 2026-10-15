import { Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import TeacherLayout from '@/layouts/teacher-layout';
import { create, destroy, edit } from '@/routes/teacher/stages';
import { index as stageQuestions } from '@/routes/teacher/stages/questions';

type StageRow = {
    id: number;
    slug: string;
    title: string;
    description: string;
    world_number: number;
    stage_number: number;
    topic: string;
    icon: string;
    difficulty: number;
    questions_per_attempt: number;
    is_final: boolean;
    sort_order: number;
    is_active: boolean;
    is_custom: boolean;
    questions_count: number;
};

type Props = {
    stages: StageRow[];
    worlds: Record<number, { name: string; tagline: string }>;
};

export default function TeacherStagesIndex({ stages, worlds }: Props) {
    return (
        <TeacherLayout title="المراحل" current="stages">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800">
                        المراحل
                    </h1>
                    <p className="mt-1 text-slate-600">
                        أضيفي مرحلة جديدة أو عدّلي الأسئلة داخل كل مرحلة.
                    </p>
                </div>
                <Link
                    href={create.url()}
                    className="game-btn bg-leaf-500 text-white hover:bg-leaf-700"
                >
                    <Plus className="size-5" aria-hidden="true" />
                    مرحلة جديدة
                </Link>
            </div>

            <div className="mt-6 space-y-3">
                {stages.map((stage) => (
                    <article
                        key={stage.id}
                        className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
                    >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <p className="text-sm font-bold text-sea-700">
                                    {worlds[stage.world_number]?.name ??
                                        `العالم ${stage.world_number}`}{' '}
                                    · المرحلة {stage.stage_number}
                                    {!stage.is_active && (
                                        <span className="ms-2 rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-600">
                                            مخفية
                                        </span>
                                    )}
                                    {stage.is_custom && (
                                        <span className="ms-2 rounded-full bg-sun-300 px-2 py-0.5 text-xs text-bark-800">
                                            معدّلة
                                        </span>
                                    )}
                                </p>
                                <h2 className="mt-1 text-xl font-extrabold text-slate-800">
                                    {stage.title}
                                </h2>
                                <p className="mt-1 text-sm text-slate-600">
                                    {stage.topic} · {stage.questions_count} سؤال
                                    · صعوبة {stage.difficulty}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Link
                                    href={stageQuestions.url(stage.slug)}
                                    className="rounded-xl bg-sea-100 px-3 py-2 text-sm font-bold text-sea-700 hover:bg-sea-200"
                                >
                                    الأسئلة
                                </Link>
                                <Link
                                    href={edit.url(stage.slug)}
                                    className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200"
                                >
                                    <Pencil
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                    تعديل
                                </Link>
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-1 rounded-xl bg-coral-400/10 px-3 py-2 text-sm font-bold text-coral-500 hover:bg-coral-400/20"
                                    onClick={() => {
                                        if (
                                            confirm(
                                                stage.is_custom
                                                    ? 'حذف هذه المرحلة نهائياً؟'
                                                    : 'إخفاء هذه المرحلة عن اللعبة؟',
                                            )
                                        ) {
                                            router.delete(
                                                destroy.url(stage.slug),
                                            );
                                        }
                                    }}
                                >
                                    <Trash2
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                    {stage.is_custom ? 'حذف' : 'إخفاء'}
                                </button>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </TeacherLayout>
    );
}
