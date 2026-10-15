import { Form, Head, usePage } from '@inertiajs/react';
import { Compass, KeyRound, LoaderCircle, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { TreasureChest } from '@/components/art/treasure-chest';
import { TurtleGuide } from '@/components/art/turtle-guide';
import { store } from '@/routes/students';
import { login as teacherLogin } from '@/routes/teacher';

const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}\s'’.-]*$/u;

function normalizeName(raw: string): string {
    return raw.trim().replace(/\s+/g, ' ');
}

function clientNameError(raw: string): string | null {
    const name = normalizeName(raw);

    if (name === '') {
        return 'اكتب اسمك من فضلك.';
    }

    if (name.length < 2 || (name.match(/\p{L}/gu) ?? []).length < 2) {
        return 'الاسم قصير جداً، اكتب حرفين على الأقل.';
    }

    if (name.length > 100) {
        return 'الاسم طويل جداً، اكتب 100 حرف أو أقل.';
    }

    if (!NAME_PATTERN.test(name)) {
        return 'اكتب اسمك بالحروف فقط (عربية أو إنجليزية).';
    }

    return null;
}

export default function Welcome() {
    const { teacher_name: teacherName, errors: pageErrors } = usePage().props;
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [localError, setLocalError] = useState<string | null>(null);

    const isTeacher = useMemo(() => {
        const expected = normalizeName(String(teacherName ?? '')).toLowerCase();
        return (
            expected !== '' &&
            normalizeName(name).toLowerCase() === expected
        );
    }, [name, teacherName]);

    return (
        <div className="bg-island-sea relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-10">
            <Head title="مرحباً" />

            <svg
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 w-full"
                viewBox="0 0 400 200"
                preserveAspectRatio="none"
                aria-hidden="true"
            >
                <path
                    d="M-20 200C20 90 120 60 200 70s170 30 220 130z"
                    fill="#fde4b0"
                />
                <path
                    d="M10 200C50 120 130 100 200 105s150 25 190 95z"
                    fill="#86e3a3"
                />
            </svg>

            <main className="relative z-10 w-full max-w-lg animate-pop rounded-[2.25rem] border-4 border-white bg-sand-50/95 p-6 text-center shadow-2xl sm:p-9">
                <div className="-mt-20 mb-1 flex items-end justify-center gap-2 sm:-mt-24">
                    <TurtleGuide
                        className="h-28 animate-float sm:h-32"
                        mood="cheer"
                    />
                    <TreasureChest className="h-24 sm:h-28" locked />
                </div>

                <p className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-sun-300 px-4 py-1 text-base font-bold text-bark-800">
                    <Compass className="size-5" aria-hidden="true" />
                    رحلة البحث عن الكنز
                </p>
                <h1 className="mt-2 text-3xl leading-tight font-extrabold text-sea-700 sm:text-4xl">
                    {isTeacher
                        ? 'مرحباً أيتها المعلمة!'
                        : 'مرحباً يا بطل الرياضيات!'}
                </h1>
                <p className="mt-2 text-lg text-slate-600">
                    {isTeacher
                        ? 'أدخلي الرمز السري للوصول إلى لوحة التحكم: اللاعبون، المراحل، والأسئلة.'
                        : 'أنا السلحفاة جود، سأرافقك في رحلة عبر الجزيرة لنحلّ ألغاز الرياضيات ونجد الكنز المخبّأ.'}
                </p>

                <Form
                    action={isTeacher ? teacherLogin() : store()}
                    className="mt-6 flex flex-col gap-3 text-start"
                    onBefore={() => {
                        const error = clientNameError(name);
                        setLocalError(error);

                        if (error) {
                            return false;
                        }

                        if (isTeacher && code.trim() === '') {
                            setLocalError('اكتبي الرمز السري من فضلك.');
                            return false;
                        }

                        return true;
                    }}
                >
                    {({ processing, errors }) => {
                        const nameError = localError ?? errors.name;
                        const codeError =
                            errors.code ??
                            (typeof pageErrors?.code === 'string'
                                ? pageErrors.code
                                : null);

                        return (
                            <>
                                <label
                                    htmlFor="name"
                                    className="text-2xl font-extrabold text-bark-800"
                                >
                                    ما اسمك؟
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        setLocalError(null);
                                    }}
                                    placeholder="اكتب اسمك هنا"
                                    autoComplete="off"
                                    autoFocus
                                    dir="auto"
                                    maxLength={100}
                                    aria-invalid={Boolean(nameError)}
                                    aria-describedby={
                                        nameError ? 'name-error' : undefined
                                    }
                                    className="h-16 w-full rounded-2xl border-4 border-sea-300 bg-white px-5 text-2xl font-bold text-slate-800 shadow-inner outline-none placeholder:text-slate-400 placeholder-shown:text-right focus:border-sun-500 aria-invalid:border-coral-400"
                                />
                                {nameError && (
                                    <p
                                        id="name-error"
                                        role="alert"
                                        className="rounded-xl bg-coral-400/15 px-3 py-2 text-base font-bold text-coral-500"
                                    >
                                        {nameError}
                                    </p>
                                )}

                                {isTeacher && (
                                    <>
                                        <label
                                            htmlFor="code"
                                            className="mt-2 flex items-center gap-2 text-xl font-extrabold text-bark-800"
                                        >
                                            <KeyRound
                                                className="size-5 text-sea-700"
                                                aria-hidden="true"
                                            />
                                            الرمز السري
                                        </label>
                                        <input
                                            id="code"
                                            name="code"
                                            type="password"
                                            inputMode="numeric"
                                            value={code}
                                            onChange={(e) => {
                                                setCode(e.target.value);
                                                setLocalError(null);
                                            }}
                                            placeholder="•••••"
                                            autoComplete="current-password"
                                            dir="ltr"
                                            maxLength={32}
                                            aria-invalid={Boolean(codeError)}
                                            aria-describedby={
                                                codeError
                                                    ? 'code-error'
                                                    : undefined
                                            }
                                            className="h-16 w-full rounded-2xl border-4 border-sun-500 bg-white px-5 text-center text-2xl font-bold tracking-[0.35em] text-slate-800 shadow-inner outline-none placeholder:tracking-normal focus:border-sea-500 aria-invalid:border-coral-400"
                                        />
                                        {codeError && (
                                            <p
                                                id="code-error"
                                                role="alert"
                                                className="rounded-xl bg-coral-400/15 px-3 py-2 text-base font-bold text-coral-500"
                                            >
                                                {codeError}
                                            </p>
                                        )}
                                    </>
                                )}

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="game-btn mt-2 h-16 bg-leaf-500 text-2xl text-white hover:bg-leaf-700"
                                >
                                    {processing ? (
                                        <LoaderCircle
                                            className="size-6 animate-spin"
                                            aria-hidden="true"
                                        />
                                    ) : isTeacher ? (
                                        <KeyRound
                                            className="size-6"
                                            aria-hidden="true"
                                        />
                                    ) : (
                                        <Sparkles
                                            className="size-6"
                                            aria-hidden="true"
                                        />
                                    )}
                                    {isTeacher
                                        ? 'دخول لوحة المعلمة'
                                        : 'ابدأ المغامرة'}
                                </button>
                            </>
                        );
                    }}
                </Form>

                <p className="mt-5 text-sm text-slate-500">
                    {isTeacher
                        ? 'حساب المعلمة محمي برمز سري. تقدّم الطلاب يبقى محفوظاً في قاعدة البيانات.'
                        : 'اكتب اسمك في كل مرة لتفتح حسابك وتكمل من حيث توقفت. كل اسم لطالب واحد فقط.'}
                </p>
            </main>
        </div>
    );
}
