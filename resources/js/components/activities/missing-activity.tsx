import { Fragment, useState } from 'react';
import { VisualAid } from '@/components/visuals/visual-aid';
import { usePreferences } from '@/hooks/use-preferences';
import type { ActivityProps, MissingQuestion } from '@/types';
import { NumberInput } from './number-input';

export function MissingActivity({
    question,
    disabled,
    onChange,
}: ActivityProps<MissingQuestion>) {
    const { n } = usePreferences();
    const data = question.data;
    const blanks =
        data.layout === 'wall'
            ? data.rows.flat().filter((v) => v === null).length
            : data.tokens.filter((t) => t === null).length;
    const [values, setValues] = useState<string[]>(() =>
        Array(blanks).fill(''),
    );

    const update = (index: number, value: string) => {
        const next = values.map((v, i) => (i === index ? value : v));
        setValues(next);
        onChange(
            next.every((v) => v !== '' && v !== '.') ? { values: next } : null,
        );
    };

    let blank = -1;
    const input = (label: string) => {
        blank += 1;
        const index = blank;

        return (
            <NumberInput
                key={`b${index}`}
                value={values[index]}
                onValue={(v) => update(index, v)}
                label={label}
                disabled={disabled}
                autoFocus={index === 0}
                className="h-14 w-24 text-2xl sm:h-16 sm:w-28 sm:text-3xl"
            />
        );
    };

    if (data.layout === 'wall') {
        return (
            <div
                dir="ltr"
                className="flex flex-col items-center gap-1.5"
                role="group"
                aria-label="جدار الجمع: كل لبنة تساوي مجموع اللبنتين تحتها"
            >
                {data.rows.map((row, r) => (
                    <div key={r} className="flex gap-1.5">
                        {row.map((cell, c) =>
                            cell === null ? (
                                <div
                                    key={c}
                                    className="flex h-16 w-24 items-center justify-center rounded-lg bg-amber-200 p-1 sm:w-28"
                                >
                                    {input(`اللبنة الفارغة في الصف ${r + 1}`)}
                                </div>
                            ) : (
                                <div
                                    key={c}
                                    className="flex h-16 w-24 items-center justify-center rounded-lg border-2 border-amber-800/40 bg-orange-300 text-2xl font-extrabold text-amber-950 shadow-[inset_0_-4px_0_rgb(0_0_0_/_0.12)] sm:w-28 sm:text-3xl"
                                >
                                    {n(cell)}
                                </div>
                            ),
                        )}
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-5">
            <VisualAid visual={data.visual} />
            <div
                dir="ltr"
                className="flex flex-wrap items-center justify-center gap-2 text-3xl font-extrabold text-slate-800 sm:gap-3 sm:text-4xl"
                role="group"
                aria-label="أكمل الفراغات"
            >
                {data.tokens.map((token, i) => (
                    <Fragment key={i}>
                        {token === null ? (
                            input(`الفراغ رقم ${blank + 2}`)
                        ) : typeof token === 'number' ? (
                            <span className="rounded-2xl bg-white px-3 py-2 shadow-sm">
                                {n(token)}
                            </span>
                        ) : (
                            <span className="px-1 text-sea-700">{token}</span>
                        )}
                        {data.layout === 'sequence' &&
                            i < data.tokens.length - 1 && (
                                <span className="text-slate-400">،</span>
                            )}
                    </Fragment>
                ))}
            </div>
        </div>
    );
}
