import {
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    ArrowUp,
    RotateCcw,
    Undo2,
} from 'lucide-react';
import { useState } from 'react';
import { GridBoard } from '@/components/visuals/measures';
import type { GridCell } from '@/components/visuals/measures';
import { usePreferences } from '@/hooks/use-preferences';
import { cn } from '@/lib/utils';
import type { ActivityProps, RouteBuildQuestion } from '@/types';

type Move = 'N' | 'S' | 'E' | 'W';

export const MOVES: Record<
    Move,
    { label: string; delta: GridCell; Icon: typeof ArrowUp }
> = {
    N: { label: 'شمال', delta: [-1, 0], Icon: ArrowUp },
    S: { label: 'جنوب', delta: [1, 0], Icon: ArrowDown },
    E: { label: 'شرق', delta: [0, 1], Icon: ArrowRight },
    W: { label: 'غرب', delta: [0, -1], Icon: ArrowLeft },
};

export function RouteBuildActivity({
    question,
    disabled,
    onChange,
}: ActivityProps<RouteBuildQuestion>) {
    const { rows, cols, start, target, obstacles } = question.data;
    const [moves, setMoves] = useState<Move[]>([]);
    const [blocked, setBlocked] = useState(false);
    const { play } = usePreferences();

    const path: GridCell[] = [start];
    for (const move of moves) {
        const [r, c] = path[path.length - 1];
        path.push([r + MOVES[move].delta[0], c + MOVES[move].delta[1]]);
    }
    const position = path[path.length - 1];

    const commit = (next: Move[]) => {
        setMoves(next);
        onChange(next.length > 0 ? { moves: next } : null);
    };

    const step = (move: Move) => {
        const [r, c] = [
            position[0] + MOVES[move].delta[0],
            position[1] + MOVES[move].delta[1],
        ];
        const hitsRock = obstacles.some(([or, oc]) => or === r && oc === c);

        if (
            r < 0 ||
            c < 0 ||
            r >= rows ||
            c >= cols ||
            hitsRock ||
            moves.length >= 30
        ) {
            play('wrong');
            setBlocked(true);
            window.setTimeout(() => setBlocked(false), 600);

            return;
        }

        play('click');
        commit([...moves, move]);
    };

    return (
        <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-start lg:justify-center lg:gap-10">
            <div className={cn(blocked && 'animate-wiggle')}>
                <GridBoard
                    rows={rows}
                    cols={cols}
                    start={start}
                    target={target}
                    obstacles={obstacles}
                    path={path.slice(1)}
                    explorer={position}
                />
            </div>
            <div className="flex flex-col items-center gap-3">
                <p
                    className="text-base font-semibold text-slate-500"
                    aria-live="polite"
                >
                    {blocked
                        ? 'لا يمكنك المرور من هنا! جرّب اتجاهاً آخر.'
                        : 'اضغط على الأسهم لتحريك المستكشف.'}
                </p>
                <div dir="ltr" className="grid grid-cols-3 gap-2">
                    <span />
                    <DirectionButton
                        move="N"
                        onClick={step}
                        disabled={disabled}
                    />
                    <span />
                    <DirectionButton
                        move="W"
                        onClick={step}
                        disabled={disabled}
                    />
                    <span />
                    <DirectionButton
                        move="E"
                        onClick={step}
                        disabled={disabled}
                    />
                    <span />
                    <DirectionButton
                        move="S"
                        onClick={step}
                        disabled={disabled}
                    />
                    <span />
                </div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        className="game-btn bg-white text-base text-slate-700"
                        disabled={disabled || moves.length === 0}
                        onClick={() => commit(moves.slice(0, -1))}
                    >
                        <Undo2 className="size-5" aria-hidden="true" />
                        تراجع
                    </button>
                    <button
                        type="button"
                        className="game-btn bg-white text-base text-slate-700"
                        disabled={disabled || moves.length === 0}
                        onClick={() => commit([])}
                    >
                        <RotateCcw className="size-5" aria-hidden="true" />
                        من جديد
                    </button>
                </div>
                {moves.length > 0 && (
                    <ol
                        className="flex max-w-xs flex-wrap justify-center gap-1"
                        aria-label="خطواتك"
                    >
                        {moves.map((move, i) => (
                            <li
                                key={i}
                                className="rounded-lg bg-sun-300 px-2 py-0.5 text-sm font-bold text-bark-800"
                            >
                                {MOVES[move].label}
                            </li>
                        ))}
                    </ol>
                )}
            </div>
        </div>
    );
}

function DirectionButton({
    move,
    onClick,
    disabled,
}: {
    move: Move;
    onClick: (move: Move) => void;
    disabled: boolean;
}) {
    const { label, Icon } = MOVES[move];

    return (
        <button
            type="button"
            className="game-btn size-16 flex-col gap-0 bg-sea-500 p-0! text-white"
            disabled={disabled}
            onClick={() => onClick(move)}
            aria-label={`خطوة نحو ${label}`}
        >
            <Icon className="size-6" aria-hidden="true" />
            <span className="text-xs">{label}</span>
        </button>
    );
}
