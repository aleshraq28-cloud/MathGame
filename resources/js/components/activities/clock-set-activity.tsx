import { Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { ClockFace } from '@/components/visuals/measures';
import { usePreferences } from '@/hooks/use-preferences';
import type { ActivityProps, ClockSetQuestion } from '@/types';

export function ClockSetActivity({
    question,
    disabled,
    onChange,
    revealAnswer,
}: ActivityProps<ClockSetQuestion>) {
    const [time, setTime] = useState({ hour: 12, minute: 0 });
    const { n, play } = usePreferences();
    const step = question.data.minute_step || 5;

    const update = (next: { hour: number; minute: number }) => {
        play('click');
        setTime(next);
        onChange(next);
    };

    const moveHour = (delta: number) =>
        update({ ...time, hour: ((time.hour - 1 + delta + 12) % 12) + 1 });
    const moveMinute = (delta: number) =>
        update({ ...time, minute: (time.minute + delta * step + 60) % 60 });

    const shown =
        revealAnswer && typeof revealAnswer.hour === 'number'
            ? {
                  hour: revealAnswer.hour as number,
                  minute: revealAnswer.minute as number,
              }
            : time;

    return (
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-8">
            <ClockFace
                hour={shown.hour}
                minute={shown.minute}
                className="size-52 sm:size-60"
                label="الساعة التي تضبطها"
            />
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 rounded-2xl bg-coral-400/15 p-3">
                    <span className="w-28 text-lg font-bold text-coral-500">
                        عقرب الساعات (القصير)
                    </span>
                    <button
                        type="button"
                        className="game-btn size-12 bg-white p-0! text-coral-500"
                        disabled={disabled}
                        onClick={() => moveHour(-1)}
                        aria-label="أرجع عقرب الساعات"
                    >
                        <Minus className="size-5" />
                    </button>
                    <button
                        type="button"
                        className="game-btn size-12 bg-coral-500 p-0! text-white"
                        disabled={disabled}
                        onClick={() => moveHour(1)}
                        aria-label="قدّم عقرب الساعات"
                    >
                        <Plus className="size-5" />
                    </button>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-sea-100 p-3">
                    <span className="w-28 text-lg font-bold text-sea-700">
                        عقرب الدقائق (الطويل)
                    </span>
                    <button
                        type="button"
                        className="game-btn size-12 bg-white p-0! text-sea-700"
                        disabled={disabled}
                        onClick={() => moveMinute(-1)}
                        aria-label={`أرجع عقرب الدقائق ${n(step)} دقائق`}
                    >
                        <Minus className="size-5" />
                    </button>
                    <button
                        type="button"
                        className="game-btn size-12 bg-sea-500 p-0! text-white"
                        disabled={disabled}
                        onClick={() => moveMinute(1)}
                        aria-label={`قدّم عقرب الدقائق ${n(step)} دقائق`}
                    >
                        <Plus className="size-5" />
                    </button>
                </div>
                <p className="max-w-60 text-sm text-slate-500">
                    كل ضغطة على عقرب الدقائق تحرّكه {n(step)} دقائق.
                </p>
            </div>
        </div>
    );
}
