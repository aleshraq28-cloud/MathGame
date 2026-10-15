import { Form, Link } from '@inertiajs/react';
import { ArrowRight, LoaderCircle, Save } from 'lucide-react';
import { useMemo, useState } from 'react';
import TeacherLayout from '@/layouts/teacher-layout';
import { index, store, update } from '@/routes/teacher/stages/questions';

type QuestionPayload = {
    id?: number;
    key: string;
    question_text: string;
    question_type: string;
    question_data: Record<string, unknown>;
    correct_answer: Record<string, unknown>;
    hint: string;
    explanation: string;
    objective: string;
    difficulty: number;
    points: number;
    sort_order: number;
    is_active: boolean;
};

type Props = {
    stage: {
        id: number;
        slug: string;
        title: string;
        stage_number: number;
        topic: string;
    };
    question: QuestionPayload | null;
    types: string[];
    type_labels: Record<string, string>;
    defaults: Partial<QuestionPayload> | null;
};

function pretty(value: unknown): string {
    return JSON.stringify(value ?? {}, null, 2);
}

export default function TeacherQuestionForm({
    stage,
    question,
    types,
    type_labels,
    defaults,
}: Props) {
    const editing = question !== null;
    const initial: QuestionPayload = {
        key: '',
        question_text: '',
        question_type: 'choice',
        question_data: {},
        correct_answer: { display: '' },
        hint: '',
        explanation: '',
        objective: stage.topic,
        difficulty: 1,
        points: 10,
        sort_order: 1,
        is_active: true,
        ...defaults,
        ...question,
    };

    const [form, setForm] = useState(initial);
    const [dataJson, setDataJson] = useState(pretty(initial.question_data));
    const [answerJson, setAnswerJson] = useState(
        pretty(initial.correct_answer),
    );
    const [jsonError, setJsonError] = useState<string | null>(null);

    const choiceOptions = useMemo(() => {
        if (form.question_type !== 'choice') {
            return null;
        }
        const options = (form.question_data.options ?? []) as {
            id: string;
            label: string;
        }[];
        return options.length > 0
            ? options
            : [
                  { id: 'a', label: '' },
                  { id: 'b', label: '' },
                  { id: 'c', label: '' },
                  { id: 'd', label: '' },
              ];
    }, [form.question_type, form.question_data]);

    const applyChoiceOptions = (options: { id: string; label: string }[]) => {
        const data = {
            ...form.question_data,
            options,
            keep_order: true,
            visual: form.question_data.visual ?? null,
        };
        const correctId =
            (form.correct_answer.option as string) || options[0]?.id || 'a';
        const correct = options.find((o) => o.id === correctId) ?? options[0];
        const answer = {
            option: correct?.id ?? 'a',
            display: correct?.label || correct?.id || '',
        };
        setForm((prev) => ({
            ...prev,
            question_data: data,
            correct_answer: answer,
        }));
        setDataJson(pretty(data));
        setAnswerJson(pretty(answer));
    };

    const syncJson = () => {
        try {
            const data = JSON.parse(dataJson) as Record<string, unknown>;
            const answer = JSON.parse(answerJson) as Record<string, unknown>;
            setForm((prev) => ({
                ...prev,
                question_data: data,
                correct_answer: answer,
            }));
            setJsonError(null);
            return true;
        } catch {
            setJsonError('صيغة JSON غير صحيحة في بيانات السؤال أو الإجابة.');
            return false;
        }
    };

    const setType = (type: string) => {
        if (type === 'number') {
            const data = { visual: null, unit: null };
            const answer = { value: 0, display: '0' };
            setForm((prev) => ({
                ...prev,
                question_type: type,
                question_data: data,
                correct_answer: answer,
            }));
            setDataJson(pretty(data));
            setAnswerJson(pretty(answer));
            return;
        }

        if (type === 'place_value') {
            const data = { target: 100 };
            const answer = {
                value: 100,
                display: '1 مئات و0 عشرات و0 آحاد',
            };
            setForm((prev) => ({
                ...prev,
                question_type: type,
                question_data: data,
                correct_answer: answer,
            }));
            setDataJson(pretty(data));
            setAnswerJson(pretty(answer));
            return;
        }

        if (type === 'clock_set') {
            const data = { minute_step: 5 };
            const answer = { hour: 3, minute: 0, display: '3:00' };
            setForm((prev) => ({
                ...prev,
                question_type: type,
                question_data: data,
                correct_answer: answer,
            }));
            setDataJson(pretty(data));
            setAnswerJson(pretty(answer));
            return;
        }

        if (type === 'choice') {
            applyChoiceOptions([
                { id: 'a', label: '' },
                { id: 'b', label: '' },
                { id: 'c', label: '' },
                { id: 'd', label: '' },
            ]);
            setForm((prev) => ({ ...prev, question_type: type }));
            return;
        }

        setForm((prev) => ({ ...prev, question_type: type }));
    };

    return (
        <TeacherLayout
            title={editing ? 'تعديل سؤال' : 'سؤال جديد'}
            current="stages"
        >
            <Link
                href={index.url(stage.slug)}
                className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-sea-700 hover:underline"
            >
                <ArrowRight className="size-4" aria-hidden="true" />
                العودة إلى أسئلة المرحلة
            </Link>

            <h1 className="text-3xl font-extrabold text-slate-800">
                {editing ? 'تعديل سؤال' : 'إضافة سؤال'}
            </h1>
            <p className="mt-1 text-slate-600">
                المرحلة {stage.stage_number}: {stage.title}
            </p>

            <Form
                action={
                    editing
                        ? update({
                              stage: stage.slug,
                              question: question.id!,
                          })
                        : store(stage.slug)
                }
                method={editing ? 'put' : 'post'}
                className="mt-6 space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                onBefore={() => syncJson()}
                transform={() => ({
                    key: form.key,
                    question_text: form.question_text,
                    question_type: form.question_type,
                    hint: form.hint,
                    explanation: form.explanation,
                    objective: form.objective,
                    difficulty: form.difficulty,
                    points: form.points,
                    sort_order: form.sort_order,
                    is_active: form.is_active ? 1 : 0,
                    question_data: dataJson,
                    correct_answer: answerJson,
                })}
            >
                {({ processing, errors }) => (
                    <>
                        <Field label="نص السؤال" error={errors.question_text}>
                            <textarea
                                name="question_text"
                                value={form.question_text}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        question_text: e.target.value,
                                    }))
                                }
                                required
                                rows={2}
                                className={inputClass}
                            />
                        </Field>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="المعرّف" error={errors.key}>
                                <input
                                    name="key"
                                    value={form.key}
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            key: e.target.value,
                                        }))
                                    }
                                    required
                                    dir="ltr"
                                    className={inputClass}
                                />
                            </Field>
                            <Field label="نوع السؤال" error={errors.question_type}>
                                <select
                                    name="question_type"
                                    value={form.question_type}
                                    onChange={(e) => setType(e.target.value)}
                                    className={inputClass}
                                >
                                    {types.map((type) => (
                                        <option key={type} value={type}>
                                            {type_labels[type] ?? type}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        </div>

                        {choiceOptions && (
                            <div className="rounded-2xl bg-sea-50 p-4">
                                <p className="mb-3 font-extrabold text-sea-700">
                                    خيارات الإجابة
                                </p>
                                <div className="space-y-2">
                                    {choiceOptions.map((option, index) => (
                                        <div
                                            key={option.id}
                                            className="flex items-center gap-2"
                                        >
                                            <input
                                                type="radio"
                                                name="correct_choice"
                                                checked={
                                                    form.correct_answer
                                                        .option === option.id
                                                }
                                                onChange={() => {
                                                    const next = [
                                                        ...choiceOptions,
                                                    ];
                                                    applyChoiceOptions(next);
                                                    const answer = {
                                                        option: option.id,
                                                        display:
                                                            option.label ||
                                                            option.id,
                                                    };
                                                    setForm((p) => ({
                                                        ...p,
                                                        correct_answer: answer,
                                                    }));
                                                    setAnswerJson(
                                                        pretty(answer),
                                                    );
                                                }}
                                                aria-label={`الإجابة الصحيحة ${option.id}`}
                                            />
                                            <span className="w-6 font-bold text-slate-500">
                                                {option.id}
                                            </span>
                                            <input
                                                value={option.label}
                                                onChange={(e) => {
                                                    const next = choiceOptions.map(
                                                        (o, i) =>
                                                            i === index
                                                                ? {
                                                                      ...o,
                                                                      label: e
                                                                          .target
                                                                          .value,
                                                                  }
                                                                : o,
                                                    );
                                                    applyChoiceOptions(next);
                                                }}
                                                className={inputClass}
                                                placeholder="نص الخيار"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <p className="mt-2 text-xs text-slate-500">
                                    اختاري الدائرة بجانب الإجابة الصحيحة.
                                </p>
                            </div>
                        )}

                        {form.question_type === 'number' && (
                            <Field label="الإجابة العددية">
                                <input
                                    type="number"
                                    value={Number(
                                        form.correct_answer.value ?? 0,
                                    )}
                                    onChange={(e) => {
                                        const value = Number(e.target.value);
                                        const answer = {
                                            value,
                                            display: String(value),
                                        };
                                        setForm((p) => ({
                                            ...p,
                                            correct_answer: answer,
                                        }));
                                        setAnswerJson(pretty(answer));
                                    }}
                                    className={inputClass}
                                />
                            </Field>
                        )}

                        {form.question_type === 'place_value' && (
                            <Field label="العدد المطلوب تكوينه (0-999)">
                                <input
                                    type="number"
                                    min={0}
                                    max={999}
                                    value={Number(
                                        form.question_data.target ??
                                            form.correct_answer.value ??
                                            0,
                                    )}
                                    onChange={(e) => {
                                        const value = Number(e.target.value);
                                        const hundreds = Math.floor(value / 100);
                                        const tens = Math.floor(
                                            (value % 100) / 10,
                                        );
                                        const ones = value % 10;
                                        const data = { target: value };
                                        const answer = {
                                            value,
                                            display: `${hundreds} مئات و${tens} عشرات و${ones} آحاد`,
                                        };
                                        setForm((p) => ({
                                            ...p,
                                            question_data: data,
                                            correct_answer: answer,
                                        }));
                                        setDataJson(pretty(data));
                                        setAnswerJson(pretty(answer));
                                    }}
                                    className={inputClass}
                                />
                            </Field>
                        )}

                        {form.question_type === 'clock_set' && (
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field label="الساعة (1-12)">
                                    <input
                                        type="number"
                                        min={1}
                                        max={12}
                                        value={Number(
                                            form.correct_answer.hour ?? 12,
                                        )}
                                        onChange={(e) => {
                                            const hour = Number(e.target.value);
                                            const minute = Number(
                                                form.correct_answer.minute ?? 0,
                                            );
                                            const answer = {
                                                hour,
                                                minute,
                                                display: `${hour}:${String(minute).padStart(2, '0')}`,
                                            };
                                            setForm((p) => ({
                                                ...p,
                                                correct_answer: answer,
                                            }));
                                            setAnswerJson(pretty(answer));
                                        }}
                                        className={inputClass}
                                    />
                                </Field>
                                <Field label="الدقائق (0, 5, 10...)">
                                    <input
                                        type="number"
                                        min={0}
                                        max={55}
                                        step={5}
                                        value={Number(
                                            form.correct_answer.minute ?? 0,
                                        )}
                                        onChange={(e) => {
                                            const minute = Number(
                                                e.target.value,
                                            );
                                            const hour = Number(
                                                form.correct_answer.hour ?? 12,
                                            );
                                            const answer = {
                                                hour,
                                                minute,
                                                display: `${hour}:${String(minute).padStart(2, '0')}`,
                                            };
                                            setForm((p) => ({
                                                ...p,
                                                correct_answer: answer,
                                            }));
                                            setAnswerJson(pretty(answer));
                                        }}
                                        className={inputClass}
                                    />
                                </Field>
                            </div>
                        )}

                        <Field label="التلميح" error={errors.hint}>
                            <textarea
                                name="hint"
                                value={form.hint}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        hint: e.target.value,
                                    }))
                                }
                                required
                                rows={2}
                                className={inputClass}
                            />
                        </Field>
                        <Field label="شرح الإجابة" error={errors.explanation}>
                            <textarea
                                name="explanation"
                                value={form.explanation}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        explanation: e.target.value,
                                    }))
                                }
                                required
                                rows={2}
                                className={inputClass}
                            />
                        </Field>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <Field label="الصعوبة" error={errors.difficulty}>
                                <input
                                    type="number"
                                    name="difficulty"
                                    min={1}
                                    max={5}
                                    value={form.difficulty}
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            difficulty: Number(e.target.value),
                                        }))
                                    }
                                    className={inputClass}
                                />
                            </Field>
                            <Field label="النقاط" error={errors.points}>
                                <input
                                    type="number"
                                    name="points"
                                    min={1}
                                    max={50}
                                    value={form.points}
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            points: Number(e.target.value),
                                        }))
                                    }
                                    className={inputClass}
                                />
                            </Field>
                            <Field label="الترتيب" error={errors.sort_order}>
                                <input
                                    type="number"
                                    name="sort_order"
                                    min={1}
                                    value={form.sort_order}
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            sort_order: Number(e.target.value),
                                        }))
                                    }
                                    className={inputClass}
                                />
                            </Field>
                        </div>

                        <label className="flex items-center gap-2 font-bold text-slate-700">
                            <input
                                type="checkbox"
                                checked={form.is_active}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        is_active: e.target.checked,
                                    }))
                                }
                            />
                            السؤال ظاهر في اللعبة
                        </label>

                        <details className="rounded-2xl border border-slate-200 p-4">
                            <summary className="cursor-pointer font-extrabold text-slate-700">
                                بيانات متقدمة (JSON)
                            </summary>
                            <p className="mt-2 text-sm text-slate-500">
                                للأنواع المتقدمة (مطابقة، ترتيب، تماثل، طرق...)
                                عدّلي JSON مباشرة. يجب أن يبقى الحقل display في
                                الإجابة.
                            </p>
                            <Field
                                label="question_data"
                                error={errors.question_data}
                            >
                                <textarea
                                    value={dataJson}
                                    onChange={(e) =>
                                        setDataJson(e.target.value)
                                    }
                                    rows={8}
                                    dir="ltr"
                                    className={`${inputClass} font-mono text-sm`}
                                />
                            </Field>
                            <Field
                                label="correct_answer"
                                error={errors.correct_answer}
                            >
                                <textarea
                                    value={answerJson}
                                    onChange={(e) =>
                                        setAnswerJson(e.target.value)
                                    }
                                    rows={6}
                                    dir="ltr"
                                    className={`${inputClass} font-mono text-sm`}
                                />
                            </Field>
                            {jsonError && (
                                <p className="text-sm font-bold text-coral-500">
                                    {jsonError}
                                </p>
                            )}
                        </details>

                        <button
                            type="submit"
                            disabled={processing}
                            className="game-btn bg-leaf-500 text-white hover:bg-leaf-700"
                        >
                            {processing ? (
                                <LoaderCircle className="size-5 animate-spin" />
                            ) : (
                                <Save className="size-5" aria-hidden="true" />
                            )}
                            حفظ السؤال
                        </button>
                    </>
                )}
            </Form>
        </TeacherLayout>
    );
}

const inputClass =
    'mt-1 w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 text-base font-semibold text-slate-800 outline-none focus:border-sea-400';

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <label className="mt-3 block">
            <span className="text-sm font-extrabold text-slate-700">
                {label}
            </span>
            {children}
            {error && (
                <span className="mt-1 block text-sm font-bold text-coral-500">
                    {error}
                </span>
            )}
        </label>
    );
}
