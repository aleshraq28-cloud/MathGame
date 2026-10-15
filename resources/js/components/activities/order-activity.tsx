import { ArrowDown, ArrowUp } from 'lucide-react';
import { useState } from 'react';
import { MathText } from '@/components/game/math-text';
import { VisualAid } from '@/components/visuals/visual-aid';
import { usePreferences } from '@/hooks/use-preferences';
import { cn } from '@/lib/utils';
import type { ActivityProps, OrderQuestion } from '@/types';

/** Reorder by tapping one card and then another (swap), or with the arrow buttons. */
export function OrderActivity({
    question,
    disabled,
    onChange,
}: ActivityProps<OrderQuestion>) {
    const [items, setItems] = useState(question.data.items);
    const [picked, setPicked] = useState<number | null>(null);
    const { n, play } = usePreferences();

    const commit = (next: typeof items) => {
        setItems(next);
        onChange({ order: next.map((i) => i.id) });
    };

    const swap = (a: number, b: number) => {
        if (b < 0 || b >= items.length) {
            return;
        }

        play('click');
        const next = [...items];
        [next[a], next[b]] = [next[b], next[a]];
        commit(next);
    };

    return (
        <div className="mx-auto flex w-full max-w-md flex-col gap-2">
            <p className="text-center text-base font-semibold text-slate-500">
                اضغط على بطاقتين لتبديل مكانيهما، أو استخدم الأسهم.
            </p>
            <span className="self-start rounded-full bg-sun-300 px-3 py-0.5 text-base font-bold text-bark-800">
                ⬆ {question.data.first_label}
            </span>
            <ol className="flex flex-col gap-2" aria-label="ترتيب البطاقات">
                {items.map((item, i) => (
                    <li key={item.id} className="flex items-center gap-2">
                        <span
                            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sea-500 text-lg font-extrabold text-white"
                            aria-hidden="true"
                        >
                            {n(i + 1)}
                        </span>
                        <button
                            type="button"
                            disabled={disabled}
                            aria-pressed={picked === i}
                            aria-label={`${item.label}، في المكان ${i + 1}${picked === i ? '، مختارة للتبديل' : ''}`}
                            onClick={() => {
                                if (picked === null) {
                                    play('click');
                                    setPicked(i);
                                } else {
                                    if (picked !== i) {
                                        swap(picked, i);
                                    }

                                    setPicked(null);
                                }
                            }}
                            className={cn(
                                'flex min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl border-4 bg-white px-4 py-2 text-xl font-bold text-slate-800 shadow-[0_4px_0_rgb(0_0_0_/_0.08)] transition sm:text-2xl',
                                picked === i
                                    ? 'animate-wiggle border-sun-500 bg-sun-300/40'
                                    : 'border-slate-200 hover:border-sea-300',
                            )}
                        >
                            {item.visual && (
                                <VisualAid
                                    visual={item.visual}
                                    compact
                                    className="w-auto"
                                />
                            )}
                            <MathText>{item.label}</MathText>
                        </button>
                        <div className="flex flex-col gap-1">
                            <button
                                type="button"
                                className="flex size-8 items-center justify-center rounded-lg bg-sea-100 text-sea-700 disabled:opacity-30"
                                disabled={disabled || i === 0}
                                onClick={() => swap(i, i - 1)}
                                aria-label={`حرّك ${item.label} إلى الأعلى`}
                            >
                                <ArrowUp className="size-5" />
                            </button>
                            <button
                                type="button"
                                className="flex size-8 items-center justify-center rounded-lg bg-sea-100 text-sea-700 disabled:opacity-30"
                                disabled={disabled || i === items.length - 1}
                                onClick={() => swap(i, i + 1)}
                                aria-label={`حرّك ${item.label} إلى الأسفل`}
                            >
                                <ArrowDown className="size-5" />
                            </button>
                        </div>
                    </li>
                ))}
            </ol>
            <span className="self-start rounded-full bg-sun-300 px-3 py-0.5 text-base font-bold text-bark-800">
                ⬇ {question.data.last_label}
            </span>
        </div>
    );
}
