import { useState } from 'react';
import { MathText } from '@/components/game/math-text';
import { VisualAid } from '@/components/visuals/visual-aid';
import { usePreferences } from '@/hooks/use-preferences';
import { cn } from '@/lib/utils';
import type { ActivityProps, MatchQuestion } from '@/types';

const COLORS = [
    'bg-sea-500',
    'bg-coral-500',
    'bg-leaf-500',
    'bg-berry-500',
    'bg-sun-500',
    'bg-bark-600',
];

/**
 * Each item on the right of the sentence gets a row of choice chips. This is
 * easier on touch screens than drawing lines and fully keyboard accessible.
 */
export function MatchActivity({
    question,
    disabled,
    onChange,
}: ActivityProps<MatchQuestion>) {
    const { left, right, many_to_one } = question.data;
    const [pairs, setPairs] = useState<Record<string, string>>({});
    const { play } = usePreferences();

    const choose = (leftId: string, rightId: string) => {
        play('click');
        const next = { ...pairs };

        if (!many_to_one) {
            for (const [l, r] of Object.entries(next)) {
                if (r === rightId && l !== leftId) {
                    delete next[l];
                }
            }
        }

        next[leftId] = rightId;
        setPairs(next);
        onChange(left.every((l) => next[l.id]) ? { pairs: next } : null);
    };

    return (
        <div className="flex flex-col gap-3">
            <p className="text-center text-base font-semibold text-slate-500">
                {many_to_one
                    ? 'ضع كل عنصر في المجموعة المناسبة.'
                    : 'اختر لكل عنصر ما يناسبه. كل إجابة تُستخدم مرة واحدة.'}
            </p>
            <ul className="flex flex-col gap-3">
                {left.map((item) => (
                    <li
                        key={item.id}
                        className={cn(
                            'flex flex-col gap-3 rounded-2xl border-4 bg-white p-3 sm:flex-row sm:items-center',
                            pairs[item.id]
                                ? 'border-leaf-300'
                                : 'border-slate-200',
                        )}
                    >
                        <div className="flex min-w-36 items-center justify-center gap-2 text-xl font-bold text-slate-800 sm:justify-start sm:text-2xl">
                            {item.visual && (
                                <VisualAid
                                    visual={item.visual}
                                    compact
                                    className="w-auto"
                                />
                            )}
                            {item.label && <MathText>{item.label}</MathText>}
                        </div>
                        <div
                            role="radiogroup"
                            aria-label={`اختر ما يناسب ${item.label || 'هذه الصورة'}`}
                            className="flex flex-1 flex-wrap justify-center gap-2 sm:justify-end"
                        >
                            {right.map((target, ti) => {
                                const isSelected = pairs[item.id] === target.id;
                                const usedElsewhere =
                                    !many_to_one &&
                                    !isSelected &&
                                    Object.values(pairs).includes(target.id);

                                return (
                                    <button
                                        key={target.id}
                                        type="button"
                                        role="radio"
                                        aria-checked={isSelected}
                                        disabled={disabled}
                                        onClick={() =>
                                            choose(item.id, target.id)
                                        }
                                        className={cn(
                                            'min-h-12 rounded-xl border-2 px-3 py-1.5 text-lg font-bold transition',
                                            isSelected
                                                ? `${COLORS[ti % COLORS.length]} border-transparent text-white shadow-md`
                                                : 'border-slate-300 bg-slate-50 text-slate-700 hover:border-sea-300',
                                            usedElsewhere && 'opacity-45',
                                        )}
                                    >
                                        <MathText>{target.label}</MathText>
                                    </button>
                                );
                            })}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
