import { CheckCircle2, Lightbulb, XCircle } from 'lucide-react';
import { MathText } from '@/components/game/math-text';
import { usePreferences } from '@/hooks/use-preferences';
import { cn } from '@/lib/utils';

export type FeedbackKind = 'correct' | 'wrong' | 'revealed';

export function QuestionFeedback({
    kind,
    points,
    triesLeft,
    explanation,
    reveal,
}: {
    kind: FeedbackKind;
    points?: number;
    triesLeft?: number;
    explanation?: string | null;
    reveal?: string | null;
}) {
    const { n } = usePreferences();

    if (kind === 'correct') {
        return (
            <div
                role="status"
                className="animate-pop rounded-3xl border-4 border-leaf-300 bg-leaf-100 p-4 text-center"
            >
                <p className="flex items-center justify-center gap-2 text-2xl font-extrabold text-leaf-700 sm:text-3xl">
                    <CheckCircle2 className="size-8" aria-hidden="true" />
                    أحسنت! إجابة صحيحة!
                </p>
                {points !== undefined && points > 0 && (
                    <p className="mt-1 text-lg font-bold text-leaf-700">
                        +{n(points)} نقاط
                    </p>
                )}
                {explanation && (
                    <p className="mt-2 text-lg text-slate-700">
                        <MathText>{explanation}</MathText>
                    </p>
                )}
            </div>
        );
    }

    if (kind === 'wrong') {
        return (
            <div
                role="status"
                className="animate-wiggle rounded-3xl border-4 border-coral-400 bg-coral-400/10 p-4 text-center"
            >
                <p className="flex items-center justify-center gap-2 text-2xl font-extrabold text-coral-500">
                    <XCircle className="size-7" aria-hidden="true" />
                    حاول مرة أخرى! فكّر جيداً.
                </p>
                {triesLeft !== undefined && (
                    <p className="mt-1 text-base font-bold text-slate-600">
                        {triesLeft === 1
                            ? 'بقيت لك محاولة واحدة.'
                            : triesLeft === 2
                              ? 'بقيت لك محاولتان.'
                              : `بقيت لك ${n(triesLeft)} محاولات.`}
                    </p>
                )}
            </div>
        );
    }

    return (
        <div
            role="status"
            className="animate-pop rounded-3xl border-4 border-sea-300 bg-sea-50 p-4 text-center"
        >
            <p className="flex items-center justify-center gap-2 text-xl font-extrabold text-sea-700 sm:text-2xl">
                <Lightbulb className="size-7" aria-hidden="true" />
                لا بأس! هيا نتعلّم معاً.
            </p>
            {reveal && (
                <p className="mt-2 text-lg font-bold text-slate-800">
                    الإجابة الصحيحة:{' '}
                    <MathText className="text-sea-700">{reveal}</MathText>
                </p>
            )}
            {explanation && (
                <p className={cn('mt-1 text-lg text-slate-700')}>
                    <MathText>{explanation}</MathText>
                </p>
            )}
        </div>
    );
}
