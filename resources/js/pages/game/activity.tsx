import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Flag,
    Lightbulb,
    LoaderCircle,
    Map as MapIcon,
    Send,
    Star,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
    ActivityRenderer,
    initialAnswer,
} from '@/components/activities/activity-renderer';
import { StageIcon } from '@/components/art/stage-icon';
import { TurtleGuide } from '@/components/art/turtle-guide';
import { MathText } from '@/components/game/math-text';
import { QuestionFeedback } from '@/components/game/question-feedback';
import type { FeedbackKind } from '@/components/game/question-feedback';
import { usePreferences } from '@/hooks/use-preferences';
import { ApiError, postJson } from '@/lib/api';
import { cn } from '@/lib/utils';
import { welcome } from '@/routes';
import { map } from '@/routes/game';
import {
    answer as answerRoute,
    complete,
    hint as hintRoute,
} from '@/routes/game/attempts';
import type {
    AnswerPayload,
    AnswerResult,
    AttemptQuestion,
    Rules,
    StageCard,
} from '@/types';

type Props = {
    stage: StageCard & { instructions: string };
    attempt: { id: number; score: number; total: number; answered: number };
    questions: AttemptQuestion[];
    rules: Rules;
};

type Feedback = { kind: FeedbackKind; points?: number };

const firstOpen = (items: AttemptQuestion[], from = 0) => {
    const after = items.findIndex((q, i) => i >= from && !q.state.resolved);

    return after >= 0 ? after : items.findIndex((q) => !q.state.resolved);
};

export default function Activity({ stage, attempt, questions, rules }: Props) {
    const { n, play } = usePreferences();
    const [items, setItems] = useState(questions);
    const [index, setIndex] = useState(() => Math.max(0, firstOpen(questions)));
    const [answer, setAnswer] = useState<AnswerPayload | null>(() =>
        initialAnswer(questions[Math.max(0, firstOpen(questions))].question),
    );
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [revealAnswer, setRevealAnswer] = useState<Record<
        string,
        unknown
    > | null>(null);
    const [lastSubmitted, setLastSubmitted] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [editedSinceFeedback, setEditedSinceFeedback] = useState(false);
    const [finishing, setFinishing] = useState(false);
    const [score, setScore] = useState(attempt.score);

    const current = items[index];
    const { question, state } = current;
    const allResolved = items.every((q) => q.state.resolved);
    const answered = items.filter((q) => q.state.resolved).length;
    const nextOpen = firstOpen(items, index + 1);

    const handleError = (error: unknown) => {
        if (error instanceof ApiError && error.sessionExpired) {
            toast.error('انتهت جلستك. اكتب اسمك مرة أخرى لتتابع.');
            router.visit(welcome.url());

            return;
        }

        if (error instanceof ApiError && error.status === 409) {
            router.reload();

            return;
        }

        toast.error(
            error instanceof Error ? error.message : 'حدث خطأ غير متوقع.',
        );
    };

    const updateState = (patch: Partial<AttemptQuestion['state']>) => {
        setItems((prev) =>
            prev.map((q, i) =>
                i === index ? { ...q, state: { ...q.state, ...patch } } : q,
            ),
        );
    };

    const goTo = (target: number) => {
        play('click');
        setIndex(target);
        setAnswer(initialAnswer(items[target].question));
        setFeedback(null);
        setEditedSinceFeedback(false);
        setRevealAnswer(null);
        setLastSubmitted(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const submit = async () => {
        if (busy || state.resolved) {
            return;
        }

        if (!answer) {
            toast('أكمل إجابتك أولاً.');

            return;
        }

        const signature = JSON.stringify(answer);

        if (signature === lastSubmitted) {
            toast('غيّر إجابتك قبل أن تتحقق مرة أخرى.');

            return;
        }

        setBusy(true);

        try {
            const result = await postJson<AnswerResult>(
                answerRoute.url(attempt.id),
                { question_id: question.id, answer },
            );
            setLastSubmitted(signature);
            setEditedSinceFeedback(false);
            setScore(result.attempt.score);
            updateState({
                tries: result.tries,
                tries_left: result.tries_left,
                resolved: result.resolved,
                correct: result.correct,
                points: result.points,
                hint: result.hint ?? state.hint,
                explanation: result.explanation,
                reveal: result.reveal,
            });

            if (result.correct) {
                play('correct');
                setFeedback({ kind: 'correct', points: result.points });
            } else if (result.resolved) {
                play('wrong');
                setFeedback({ kind: 'revealed' });
                setRevealAnswer(result.reveal_answer);
            } else {
                play('wrong');
                setFeedback({ kind: 'wrong' });
            }
        } catch (error) {
            handleError(error);
        } finally {
            setBusy(false);
        }
    };

    const askHint = async () => {
        if (busy || state.hint) {
            return;
        }

        setBusy(true);

        try {
            const result = await postJson<{ hint: string }>(
                hintRoute.url({ attempt: attempt.id, question: question.id }),
            );
            play('click');
            updateState({ hint: result.hint });
        } catch (error) {
            handleError(error);
        } finally {
            setBusy(false);
        }
    };

    const finish = () => {
        router.post(
            complete.url(attempt.id),
            {},
            {
                onStart: () => setFinishing(true),
                onFinish: () => setFinishing(false),
                onError: () => toast.error('أجب عن كل الأسئلة أولاً.'),
            },
        );
    };

    const resolvedView = state.resolved;
    const showFeedback: Feedback | null =
        feedback ??
        (resolvedView
            ? {
                  kind: state.correct ? 'correct' : 'revealed',
                  points: state.points,
              }
            : state.tries > 0 && !editedSinceFeedback
              ? { kind: 'wrong' }
              : null);

    return (
        <div className="bg-parchment min-h-dvh">
            <Head title={`${stage.title} - السؤال ${index + 1}`} />

            <header className="sticky top-0 z-30 border-b-4 border-sand-200 bg-sand-50/95 backdrop-blur">
                <div className="mx-auto flex max-w-4xl items-center gap-3 px-3 py-2 sm:px-5">
                    <Link
                        href={map.url()}
                        className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white text-sea-700 shadow-[0_4px_0_rgb(0_0_0_/_0.12)] ring-2 ring-sea-100"
                        aria-label="العودة إلى الخريطة (يُحفظ تقدّمك)"
                        title="العودة إلى الخريطة"
                    >
                        <MapIcon className="size-5" />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                        <p className="flex items-center gap-1.5 truncate text-base font-extrabold text-bark-800 sm:text-lg">
                            <StageIcon
                                name={stage.icon}
                                className="size-5 shrink-0 text-coral-500"
                            />
                            {stage.title}
                        </p>
                        <ol
                            className="mt-1 flex gap-1"
                            aria-label={`السؤال ${index + 1} من ${items.length}`}
                        >
                            {items.map((q, i) => (
                                <li key={q.position} className="flex-1">
                                    <button
                                        type="button"
                                        onClick={() => goTo(i)}
                                        disabled={busy}
                                        aria-label={`السؤال ${i + 1}${q.state.resolved ? (q.state.correct ? '، صحيح' : '، انتهى') : ''}`}
                                        aria-current={
                                            i === index ? 'step' : undefined
                                        }
                                        className={cn(
                                            'block h-3 w-full rounded-full transition-all',
                                            q.state.resolved
                                                ? q.state.correct
                                                    ? 'bg-leaf-500'
                                                    : 'bg-coral-400'
                                                : 'bg-slate-200',
                                            i === index &&
                                                'h-3 ring-2 ring-sea-500 ring-offset-1',
                                        )}
                                    />
                                </li>
                            ))}
                        </ol>
                    </div>
                    <span
                        className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1 text-lg font-extrabold text-bark-800 ring-2 ring-sun-300"
                        aria-label={`النقاط: ${score}`}
                    >
                        <Star
                            className="size-5 fill-sun-400 text-sun-500"
                            aria-hidden="true"
                        />
                        {n(score)}
                    </span>
                </div>
            </header>

            <main
                id="main"
                className="mx-auto w-full max-w-4xl px-3 py-5 sm:px-5 sm:py-8"
            >
                <section
                    className="rounded-[2rem] border-4 border-white bg-white/90 p-4 shadow-xl sm:p-7"
                    aria-labelledby="question-text"
                >
                    <div className="mb-4 flex items-start gap-3">
                        <TurtleGuide
                            className="hidden h-16 shrink-0 sm:block"
                            mood={
                                feedback?.kind === 'correct'
                                    ? 'cheer'
                                    : state.hint
                                      ? 'thinking'
                                      : 'happy'
                            }
                        />
                        <div className="flex-1">
                            <p className="text-base font-bold text-sea-700">
                                السؤال {n(index + 1)} من {n(items.length)}
                                {!state.resolved && state.tries > 0 && (
                                    <span className="ms-2 text-coral-500">
                                        · المحاولة {n(state.tries + 1)} من{' '}
                                        {n(rules.max_tries)}
                                    </span>
                                )}
                            </p>
                            <h1
                                id="question-text"
                                className="mt-1 text-2xl leading-snug font-extrabold text-slate-800 sm:text-3xl"
                            >
                                <MathText>{question.text}</MathText>
                            </h1>
                        </div>
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            void submit();
                        }}
                        className="flex flex-col gap-6"
                    >
                        <div
                            className={cn(
                                'rounded-3xl bg-sand-50 p-3 sm:p-5',
                                resolvedView &&
                                    'pointer-events-none opacity-90',
                            )}
                        >
                            <ActivityRenderer
                                key={`${question.id}`}
                                question={question}
                                disabled={busy || resolvedView}
                                revealAnswer={revealAnswer}
                                onChange={(value) => {
                                    setAnswer(value);
                                    setEditedSinceFeedback(true);

                                    if (feedback?.kind === 'wrong') {
                                        setFeedback(null);
                                    }
                                }}
                            />
                        </div>

                        {state.hint && !resolvedView && (
                            <div
                                className="flex items-start gap-3 rounded-3xl border-4 border-sun-300 bg-sun-300/25 p-4"
                                role="note"
                            >
                                <Lightbulb
                                    className="mt-0.5 size-7 shrink-0 text-sun-500"
                                    aria-hidden="true"
                                />
                                <p className="text-lg font-semibold text-bark-800">
                                    <span className="font-extrabold">
                                        تلميح:{' '}
                                    </span>
                                    <MathText>{state.hint}</MathText>
                                </p>
                            </div>
                        )}

                        {showFeedback && (
                            <QuestionFeedback
                                kind={showFeedback.kind}
                                points={showFeedback.points}
                                triesLeft={state.tries_left}
                                explanation={state.explanation}
                                reveal={state.reveal}
                            />
                        )}

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                            {!resolvedView ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => void askHint()}
                                        disabled={
                                            busy ||
                                            Boolean(state.hint) ||
                                            !question.has_hint
                                        }
                                        className="game-btn bg-sun-300 text-bark-800 hover:bg-sun-400"
                                    >
                                        <Lightbulb
                                            className="size-5"
                                            aria-hidden="true"
                                        />
                                        {state.hint
                                            ? 'التلميح ظاهر'
                                            : 'أحتاج تلميحاً'}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={busy || !answer}
                                        className="game-btn h-14 min-w-48 bg-leaf-500 text-xl text-white hover:bg-leaf-700"
                                    >
                                        {busy ? (
                                            <LoaderCircle
                                                className="size-6 animate-spin"
                                                aria-hidden="true"
                                            />
                                        ) : (
                                            <Send
                                                className="size-5 -scale-x-100"
                                                aria-hidden="true"
                                            />
                                        )}
                                        تحقّق من إجابتي
                                    </button>
                                </>
                            ) : allResolved ? (
                                <button
                                    type="button"
                                    onClick={finish}
                                    disabled={finishing}
                                    className="game-btn h-16 w-full bg-coral-500 text-2xl text-white hover:bg-coral-400 sm:ms-auto sm:w-auto"
                                >
                                    {finishing ? (
                                        <LoaderCircle
                                            className="size-6 animate-spin"
                                            aria-hidden="true"
                                        />
                                    ) : (
                                        <Flag
                                            className="size-6"
                                            aria-hidden="true"
                                        />
                                    )}
                                    اعرض نتيجتي
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => goTo(nextOpen)}
                                    className="game-btn h-14 w-full bg-sea-500 text-xl text-white hover:bg-sea-700 sm:ms-auto sm:w-auto"
                                    autoFocus
                                >
                                    السؤال التالي
                                    <ArrowLeft
                                        className="size-6"
                                        aria-hidden="true"
                                    />
                                </button>
                            )}
                        </div>
                    </form>
                </section>

                <p className="mt-4 text-center text-base font-semibold text-slate-500">
                    أجبت عن {n(answered)} من {n(items.length)} · يُحفظ تقدّمك
                    تلقائياً ويمكنك العودة لاحقاً.
                </p>
            </main>
        </div>
    );
}
