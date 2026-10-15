import { useState } from 'react';
import { usePreferences } from '@/hooks/use-preferences';
import { cn } from '@/lib/utils';
import type { ActivityProps, Cell, SymmetryQuestion } from '@/types';

const key = (c: Cell) => `${c[0]}:${c[1]}`;

export function SymmetryActivity({
    question,
    disabled,
    onChange,
    revealAnswer,
}: ActivityProps<SymmetryQuestion>) {
    const { rows, cols, axis, given } = question.data;
    const [marked, setMarked] = useState<Cell[]>([]);
    const { play } = usePreferences();
    const givenSet = new Set(given.map(key));
    const markedSet = new Set(marked.map(key));
    const revealSet = new Set(
        ((revealAnswer?.cells as Cell[] | undefined) ?? []).map(key),
    );

    const toggle = (cell: Cell) => {
        play('click');
        const next = markedSet.has(key(cell))
            ? marked.filter((c) => key(c) !== key(cell))
            : [...marked, cell];
        setMarked(next);
        onChange(next.length > 0 ? { cells: next } : null);
    };

    const size = cols > 6 ? 'size-9 sm:size-11' : 'size-11 sm:size-12';

    return (
        <div className="flex flex-col items-center gap-3">
            <p className="text-center text-base font-semibold text-slate-500">
                لوّن المربعات في الجهة الأخرى من الخط الأحمر لتكمل الشكل المتماثل.
            </p>
            <div
                dir="ltr"
                className="relative inline-grid gap-1 rounded-2xl bg-slate-200 p-1.5"
                style={{
                    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                }}
            >
                {Array.from({ length: rows * cols }, (_, i) => {
                    const cell: Cell = [Math.floor(i / cols), i % cols];
                    const k = key(cell);
                    const isGiven = givenSet.has(k);
                    const isMarked = markedSet.has(k);
                    const isReveal = revealSet.has(k);

                    return (
                        <button
                            key={k}
                            type="button"
                            disabled={disabled || isGiven}
                            aria-pressed={isGiven || isMarked}
                            aria-label={`الصف ${cell[0] + 1}، العمود ${cell[1] + 1}${isGiven ? '، ملوّن مسبقاً' : ''}`}
                            onClick={() => toggle(cell)}
                            className={cn(
                                'rounded-md transition-colors',
                                size,
                                isGiven
                                    ? 'bg-sea-500'
                                    : isMarked
                                      ? 'bg-coral-400'
                                      : 'bg-white hover:bg-sun-300/60',
                                isReveal &&
                                    !isMarked &&
                                    'bg-leaf-300 ring-4 ring-leaf-500 ring-inset',
                                isReveal &&
                                    isMarked &&
                                    'ring-4 ring-leaf-500 ring-inset',
                            )}
                        />
                    );
                })}
                <span
                    aria-hidden="true"
                    className={cn(
                        'pointer-events-none absolute bg-red-500',
                        axis === 'vertical'
                            ? 'inset-y-0 left-1/2 w-1 -translate-x-1/2'
                            : 'inset-x-0 top-1/2 h-1 -translate-y-1/2',
                    )}
                />
            </div>
        </div>
    );
}
