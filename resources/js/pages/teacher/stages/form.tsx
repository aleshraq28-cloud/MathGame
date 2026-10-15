import { Form, Link } from '@inertiajs/react';
import { ArrowRight, LoaderCircle, Save } from 'lucide-react';
import { useState } from 'react';
import TeacherLayout from '@/layouts/teacher-layout';
import { index, store, update } from '@/routes/teacher/stages';

type StageFields = {
    id?: number;
    slug: string;
    title: string;
    description: string;
    world_number: number;
    stage_number: number;
    topic: string;
    instructions: string;
    icon: string;
    difficulty: number;
    questions_per_attempt: number;
    is_final: boolean;
    sort_order: number;
    is_active: boolean;
};

type Props = {
    stage: StageFields | null;
    worlds: Record<number, { name: string; tagline: string }>;
    icons: string[];
    defaults: Partial<StageFields> | null;
};

export default function TeacherStageForm({
    stage,
    worlds,
    icons,
    defaults,
}: Props) {
    const editing = stage !== null;
    const initial: StageFields = {
        slug: '',
        title: '',
        description: '',
        topic: '',
        instructions: '',
        icon: 'target',
        world_number: 1,
        stage_number: 1,
        difficulty: 1,
        questions_per_attempt: 8,
        sort_order: 10,
        is_final: false,
        is_active: true,
        ...defaults,
        ...stage,
    };

    const [form, setForm] = useState(initial);

    const set =
        (key: keyof StageFields) =>
        (
            e: React.ChangeEvent<
                HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
            >,
        ) => {
            const value =
                e.target.type === 'checkbox'
                    ? (e.target as HTMLInputElement).checked
                    : e.target.type === 'number'
                      ? Number(e.target.value)
                      : e.target.value;
            setForm((prev) => ({ ...prev, [key]: value }));
        };

    return (
        <TeacherLayout
            title={editing ? 'تعديل مرحلة' : 'مرحلة جديدة'}
            current="stages"
        >
            <Link
                href={index.url()}
                className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-sea-700 hover:underline"
            >
                <ArrowRight className="size-4" aria-hidden="true" />
                العودة إلى المراحل
            </Link>

            <h1 className="text-3xl font-extrabold text-slate-800">
                {editing ? `تعديل: ${stage.title}` : 'إضافة مرحلة جديدة'}
            </h1>

            <Form
                action={
                    editing ? update(stage.slug!) : store()
                }
                method={editing ? 'put' : 'post'}
                className="mt-6 space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            >
                {({ processing, errors }) => (
                    <>
                        <Field label="العنوان" error={errors.title}>
                            <input
                                name="title"
                                value={form.title}
                                onChange={set('title')}
                                required
                                className={inputClass}
                            />
                        </Field>
                        <Field
                            label="المعرّف الإنجليزي (slug)"
                            error={errors.slug}
                        >
                            <input
                                name="slug"
                                value={form.slug}
                                onChange={set('slug')}
                                required
                                dir="ltr"
                                className={inputClass}
                                placeholder="my-new-stage"
                            />
                        </Field>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="العالم" error={errors.world_number}>
                                <select
                                    name="world_number"
                                    value={form.world_number}
                                    onChange={set('world_number')}
                                    className={inputClass}
                                >
                                    {Object.entries(worlds).map(
                                        ([num, world]) => (
                                            <option key={num} value={num}>
                                                {num}. {world.name}
                                            </option>
                                        ),
                                    )}
                                </select>
                            </Field>
                            <Field
                                label="رقم المرحلة"
                                error={errors.stage_number}
                            >
                                <input
                                    type="number"
                                    name="stage_number"
                                    value={form.stage_number}
                                    onChange={set('stage_number')}
                                    min={1}
                                    className={inputClass}
                                />
                            </Field>
                        </div>
                        <Field label="الموضوع" error={errors.topic}>
                            <input
                                name="topic"
                                value={form.topic}
                                onChange={set('topic')}
                                required
                                className={inputClass}
                            />
                        </Field>
                        <Field label="الوصف" error={errors.description}>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={set('description')}
                                required
                                rows={2}
                                className={inputClass}
                            />
                        </Field>
                        <Field label="التعليمات" error={errors.instructions}>
                            <textarea
                                name="instructions"
                                value={form.instructions}
                                onChange={set('instructions')}
                                required
                                rows={3}
                                className={inputClass}
                            />
                        </Field>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <Field label="الأيقونة" error={errors.icon}>
                                <select
                                    name="icon"
                                    value={form.icon}
                                    onChange={set('icon')}
                                    className={inputClass}
                                >
                                    {icons.map((icon) => (
                                        <option key={icon} value={icon}>
                                            {icon}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                            <Field
                                label="الصعوبة (1-5)"
                                error={errors.difficulty}
                            >
                                <input
                                    type="number"
                                    name="difficulty"
                                    value={form.difficulty}
                                    onChange={set('difficulty')}
                                    min={1}
                                    max={5}
                                    className={inputClass}
                                />
                            </Field>
                            <Field
                                label="أسئلة لكل محاولة"
                                error={errors.questions_per_attempt}
                            >
                                <input
                                    type="number"
                                    name="questions_per_attempt"
                                    value={form.questions_per_attempt}
                                    onChange={set('questions_per_attempt')}
                                    min={1}
                                    max={20}
                                    className={inputClass}
                                />
                            </Field>
                        </div>
                        <Field label="ترتيب العرض" error={errors.sort_order}>
                            <input
                                type="number"
                                name="sort_order"
                                value={form.sort_order}
                                onChange={set('sort_order')}
                                min={1}
                                className={inputClass}
                            />
                        </Field>
                        <input
                            type="hidden"
                            name="is_active"
                            value={form.is_active ? '1' : '0'}
                        />
                        <input
                            type="hidden"
                            name="is_final"
                            value={form.is_final ? '1' : '0'}
                        />
                        <label className="flex items-center gap-2 font-bold text-slate-700">
                            <input
                                type="checkbox"
                                checked={form.is_active}
                                onChange={set('is_active')}
                            />
                            المرحلة ظاهرة في اللعبة
                        </label>
                        <label className="flex items-center gap-2 font-bold text-slate-700">
                            <input
                                type="checkbox"
                                checked={form.is_final}
                                onChange={set('is_final')}
                            />
                            مرحلة الكنز النهائية
                        </label>

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
                            حفظ المرحلة
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
        <label className="block">
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
