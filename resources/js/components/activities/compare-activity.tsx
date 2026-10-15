import { useState } from 'react';
import { MathText } from '@/components/game/math-text';
import { usePreferences } from '@/hooks/use-preferences';
import { cn } from '@/lib/utils';
import type { ActivityProps, CompareQuestion } from '@/types';

const SYMBOLS = [
    { symbol: '<', label: 'أصغر من' },
    { symbol: '=', label: 'يساوي' },
    { symbol: '>', label: 'أكبر من' },
] as const;

export function CompareActivity({
    question,
    disabled,
    onChange,
}: ActivityProps<CompareQuestion>) {
    const [symbol, setSymbol] = useState<string | null>(null);
    const { play } = usePreferences();

    return (
        <div className="flex flex-col items-center gap-6">
            <div
                dir="ltr"
                className="flex flex-wrap items-center justify-center gap-3 text-2xl font-extrabold sm:text-3xl"
            >
                <span
                    dir="rtl"
                    className="rounded-2xl border-4 border-sea-300 bg-white px-4 py-3 text-slate-800"
                >
                    <MathText>{question.data.left}</MathText>
                </span>
                <span
                    className={cn(
                        'flex size-16 items-center justify-center rounded-full border-4 border-dashed text-4xl',
                        symbol
                            ? 'border-sun-500 bg-sun-300 text-bark-800'
                            : 'border-slate-300 bg-white text-slate-300',
                    )}
                    aria-live="polite"
                >
                    {symbol ?? '؟'}
                </span>
                <span
                    dir="rtl"
                    className="rounded-2xl border-4 border-sea-300 bg-white px-4 py-3 text-slate-800"
                >
                    <MathText>{question.data.right}</MathText>
                </span>
            </div>
            <div
                role="radiogroup"
                aria-label="اختر الإشارة"
                dir="ltr"
                className="flex gap-3"
            >
                {SYMBOLS.map((item) => (
                    <button
                        key={item.symbol}
                        type="button"
                        role="radio"
                        aria-checked={symbol === item.symbol}
                        aria-label={item.label}
                        title={item.label}
                        disabled={disabled}
                        onClick={() => {
                            play('click');
                            setSymbol(item.symbol);
                            onChange({ symbol: item.symbol });
                        }}
                        className={cn(
                            'game-btn size-18 text-4xl',
                            symbol === item.symbol
                                ? 'bg-sea-500 text-white'
                                : 'bg-white text-sea-700',
                        )}
                    >
                        {item.symbol}
                    </button>
                ))}
            </div>
        </div>
    );
}
