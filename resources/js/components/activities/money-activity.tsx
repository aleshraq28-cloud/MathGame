import { RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { MoneyPiece } from '@/components/visuals/measures';
import { usePreferences } from '@/hooks/use-preferences';
import type { ActivityProps, MoneyQuestion } from '@/types';

const MAX_PIECES = 20;

export function MoneyActivity({
    question,
    disabled,
    onChange,
}: ActivityProps<MoneyQuestion>) {
    const { denominations, unit } = question.data;
    const [tray, setTray] = useState<number[]>([]);
    const { n, play } = usePreferences();
    const total = tray.reduce((sum, v) => sum + v, 0);

    const commit = (next: number[]) => {
        setTray(next);
        onChange(next.length > 0 ? { coins: next } : null);
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <p className="text-center text-base font-semibold text-slate-500">
                اضغط على النقود لتضعها في المحفظة. اضغط على قطعة في المحفظة
                لإرجاعها.
            </p>
            <div
                className="flex flex-wrap justify-center gap-3"
                role="group"
                aria-label="النقود المتاحة"
            >
                {denominations.map((value) => (
                    <button
                        key={value}
                        type="button"
                        disabled={disabled || tray.length >= MAX_PIECES}
                        onClick={() => {
                            play('click');
                            commit([...tray, value]);
                        }}
                        className="rounded-2xl p-1 transition hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
                        aria-label={`أضف ${value} ${unit}`}
                    >
                        <MoneyPiece value={value} unit={unit} />
                    </button>
                ))}
            </div>
            <div className="flex min-h-28 w-full max-w-lg flex-col items-center gap-2 rounded-3xl border-4 border-dashed border-bark-600/40 bg-sand-100 p-3">
                <span className="text-base font-bold text-bark-600">
                    المحفظة
                </span>
                <div
                    className="flex flex-wrap justify-center gap-2"
                    aria-live="polite"
                >
                    {tray.length === 0 && (
                        <span className="text-slate-400">فارغة</span>
                    )}
                    {tray.map((value, i) => (
                        <button
                            key={i}
                            type="button"
                            disabled={disabled}
                            onClick={() => {
                                play('click');
                                commit(tray.filter((_, j) => j !== i));
                            }}
                            className="animate-pop rounded-2xl"
                            aria-label={`أرجع ${value} ${unit}`}
                        >
                            <MoneyPiece value={value} unit={unit} />
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-lg font-extrabold text-bark-800">
                        المجموع: {n(total)} {unit}
                    </span>
                    {tray.length > 0 && (
                        <button
                            type="button"
                            disabled={disabled}
                            onClick={() => commit([])}
                            className="inline-flex items-center gap-1 rounded-xl bg-white px-2 py-1 text-sm font-bold text-slate-600"
                        >
                            <RotateCcw className="size-4" aria-hidden="true" />
                            أفرغ
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
