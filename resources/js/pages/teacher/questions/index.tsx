import { Link, router } from '@inertiajs/react';
import { ArrowRight, Pencil, Plus, Trash2 } from 'lucide-react';
import TeacherLayout from '@/layouts/teacher-layout';
import { index as stagesIndex } from '@/routes/teacher/stages';
import {
    create,
    destroy,
    edit,
} from '@/routes/teacher/stages/questions';

type QuestionRow = {
    id: number;
    key: string;
    question_text: string;
    question_type: string;
    difficulty: number;
    points: number;
    sort_order: number;
    is_active: boolean;
    is_custom: boolean;
    answer_display: string | null;
};

type Props = {
    stage: {
        id: number;
        slug: string;
        title: string;
        stage_number: number;
        topic: string;
        is_custom: boolean;
    };
    questions: QuestionRow[];
    types: string[];
};

export default function TeacherQuestionsIndex({ stage, questions }: Props) {
    return (
        <TeacherLayout title={`أسئلة: ${stage.title}`} current="stages">
            <Link
                href={stagesIndex.url()}
                className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-sea-700 hover:underline"
            >
                <ArrowRight className="size-4" aria-hidden="true" />
                العودة إلى المراحل
            </Link>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="text-sm font-bold text-sea-700">
                        المرحلة {stage.stage_number}
                    </p>
                    <h1 className="text-3xl font-extrabold text-slate-800">
                        أسئلة: {stage.title}
                    </h1>
                    <p className="mt-1 text-slate-600">
                        {questions.length} سؤال · {stage.topic}
                    </p>
                </div>
                <Link
                    href={create.url(stage.slug)}
                    className="game-btn bg-leaf-500 text-white hover:bg-leaf-700"
                >
                    <Plus className="size-5" aria-hidden="true" />
                    سؤال جديد
                </Link>
            </div>

            <div className="mt-6 space-y-3">
                {questions.map((question) => (
                    <article
                        key={question.id}
                        className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-slate-500">
                                    #{question.sort_order} · {question.key} ·{' '}
                                    {question.question_type}
                                    {!question.is_active && (
                                        <span className="ms-2 rounded-full bg-slate-200 px-2 py-0.5 text-slate-600">
                                            مخفي
                                        </span>
                                    )}
                                    {question.is_custom && (
                                        <span className="ms-2 rounded-full bg-sun-300 px-2 py-0.5 text-bark-800">
                                            معدّل
                                        </span>
                                    )}
                                </p>
                                <h2 className="mt-1 text-lg font-extrabold text-slate-800">
                                    {question.question_text}
                                </h2>
                                {question.answer_display && (
                                    <p className="mt-1 text-sm text-leaf-700">
                                        الإجابة: {question.answer_display}
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Link
                                    href={edit.url({
                                        stage: stage.slug,
                                        question: question.id,
                                    })}
                                    className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700"
                                >
                                    <Pencil className="size-4" />
                                    تعديل
                                </Link>
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-1 rounded-xl bg-coral-400/10 px-3 py-2 text-sm font-bold text-coral-500"
                                    onClick={() => {
                                        if (
                                            confirm(
                                                question.is_custom
                                                    ? 'حذف هذا السؤال؟'
                                                    : 'إخفاء هذا السؤال عن اللعبة؟',
                                            )
                                        ) {
                                            router.delete(
                                                destroy.url({
                                                    stage: stage.slug,
                                                    question: question.id,
                                                }),
                                            );
                                        }
                                    }}
                                >
                                    <Trash2 className="size-4" />
                                    {question.is_custom ? 'حذف' : 'إخفاء'}
                                </button>
                            </div>
                        </div>
                    </article>
                ))}

                {questions.length === 0 && (
                    <p className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-sm">
                        لا توجد أسئلة بعد. أضيفي السؤال الأول.
                    </p>
                )}
            </div>
        </TeacherLayout>
    );
}
