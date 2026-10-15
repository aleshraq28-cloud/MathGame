import { Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { HundredFlat, OneCube, TenRod } from '@/components/visuals/numbers';
import { usePreferences } from '@/hooks/use-preferences';
import type { ActivityProps, PlaceValueQuestion } from '@/types';

type Parts = { hundreds: number; tens: number; ones: number };

const PLACES = [
    { key: 'hundreds', label: 'مئات', color: 'bg-blue-100 border-blue-300' },
    { key: 'tens', label: 'عشرات', color: 'bg-green-100 border-green-300' },
    { key: 'ones', label: 'آحاد', color: 'bg-orange-100 border-orange-300' },
] as const;

const MAX = 15;

export function PlaceValueActivity({
    disabled,
    onChange,
}: ActivityProps<PlaceValueQuestion>) {
    const [parts, setParts] = useState<Parts>({
        hundreds: 0,
        tens: 0,
        ones: 0,
    });
    const { n, play } = usePreferences();

    const change = (key: keyof Parts, delta: number) => {
        const next = {
            ...parts,
            [key]: Math.min(MAX, Math.max(0, parts[key] + delta)),
        };
        play('click');
        setParts(next);
        onChange(next.hundreds + next.tens + next.ones > 0 ? next : null);
    };

    return (
        <div dir="ltr" className="grid grid-cols-3 gap-2 sm:gap-4">
            {PLACES.map((place) => (
                <div
                    key={place.key}
                    dir="rtl"
                    className={`flex flex-col items-center gap-2 rounded-2xl border-4 p-2 sm:p-3 ${place.color}`}
                >
                    <span className="text-lg font-extrabold text-slate-700">
                        {place.label}
                    </span>
                    <div
                        className="flex min-h-36 w-full flex-wrap content-end items-end justify-center gap-1"
                        dir="ltr"
                        aria-hidden="true"
                    >
                        {Array.from({ length: parts[place.key] }, (_, i) =>
                            place.key === 'hundreds' ? (
                                <HundredFlat
                                    key={i}
                                    className="size-9 sm:size-11"
                                />
                            ) : place.key === 'tens' ? (
                                <TenRod key={i} className="h-11 sm:h-14" />
                            ) : (
                                <OneCube key={i} className="size-3" />
                            ),
                        )}
                    </div>
                    <span
                        className="text-3xl font-extrabold text-slate-800"
                        aria-live="polite"
                        aria-label={`${parts[place.key]} ${place.label}`}
                    >
                        {n(parts[place.key])}
                    </span>
                    <div className="flex gap-1.5">
                        <button
                            type="button"
                            className="game-btn size-11 min-h-11 bg-white p-0! text-slate-700"
                            disabled={disabled || parts[place.key] === 0}
                            onClick={() => change(place.key, -1)}
                            aria-label={`أنقص ${place.label}`}
                        >
                            <Minus className="size-5" />
                        </button>
                        <button
                            type="button"
                            className="game-btn size-11 min-h-11 bg-leaf-500 p-0! text-white"
                            disabled={disabled || parts[place.key] === MAX}
                            onClick={() => change(place.key, 1)}
                            aria-label={`أضف ${place.label}`}
                        >
                            <Plus className="size-5" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
