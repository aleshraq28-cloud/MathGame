import { Check } from 'lucide-react';
import { useState } from 'react';
import { MathText } from '@/components/game/math-text';
import { VisualAid } from '@/components/visuals/visual-aid';
import { usePreferences } from '@/hooks/use-preferences';
import { cn } from '@/lib/utils';
import type { ActivityProps, ChoiceQuestion } from '@/types';

export function ChoiceActivity({
    question,
    disabled,
    onChange,
}: ActivityProps<ChoiceQuestion>) {
    const [selected, setSelected] = useState<string | null>(null);
    const { play } = usePreferences();
    const options = question.data.options;
    const visualOptions = options.some((o) => o.visual);

    return (
        <div className="flex flex-col gap-5">
            <VisualAid visual={question.data.visual} />
            <div
                role="radiogroup"
                aria-label="اختر الإجابة"
                className={cn(
                    'grid gap-3',
                    visualOptions
                        ? 'grid-cols-2 sm:grid-cols-3'
                        : options.length <= 2
                          ? 'grid-cols-2'
                          : 'grid-cols-1 sm:grid-cols-2',
                )}
            >
                {options.map((option) => {
                    const isSelected = selected === option.id;

                    return (
                        <button
                            key={option.id}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            disabled={disabled}
                            onClick={() => {
                                play('click');
                                setSelected(option.id);
                                onChange({ option: option.id });
                            }}
                            className={cn(
                                'relative flex min-h-16 flex-col items-center justify-center gap-2 rounded-2xl border-4 bg-white px-4 py-3 text-xl font-bold text-slate-800 shadow-[0_5px_0_rgb(0_0_0_/_0.1)] transition hover:-translate-y-0.5 hover:border-sea-300 disabled:hover:translate-y-0 sm:text-2xl',
                                isSelected
                                    ? 'border-sea-500 bg-sea-50 ring-4 ring-sea-100'
                                    : 'border-slate-200',
                            )}
                        >
                            {isSelected && (
                                <span
                                    className="absolute -end-2.5 -top-2.5 flex size-7 items-center justify-center rounded-full bg-sea-500 text-white"
                                    aria-hidden="true"
                                >
                                    <Check className="size-4" strokeWidth={3} />
                                </span>
                            )}
                            {option.visual && (
                                <VisualAid visual={option.visual} compact />
                            )}
                            {option.label && (
                                <MathText>{option.label}</MathText>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
