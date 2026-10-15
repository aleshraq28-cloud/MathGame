import { useState } from 'react';
import { GridBoard } from '@/components/visuals/measures';
import type { GridCell } from '@/components/visuals/measures';
import { usePreferences } from '@/hooks/use-preferences';
import type { ActivityProps, RouteFollowQuestion } from '@/types';

export function RouteFollowActivity({
    question,
    disabled,
    onChange,
    revealAnswer,
}: ActivityProps<RouteFollowQuestion>) {
    const { rows, cols, start, obstacles } = question.data;
    const [cell, setCell] = useState<GridCell | null>(null);
    const { play } = usePreferences();
    const revealed = (revealAnswer?.cell as GridCell | undefined) ?? null;

    return (
        <div className="flex flex-col items-center gap-3">
            <p className="text-center text-base font-semibold text-slate-500">
                اتبع الخطوات بعينك، ثم اضغط على المربع الذي يصل إليه المستكشف.
            </p>
            <GridBoard
                rows={rows}
                cols={cols}
                start={start}
                obstacles={obstacles}
                marked={cell ? [cell] : []}
                path={revealed ? [revealed] : []}
                onCellClick={
                    disabled
                        ? undefined
                        : (next) => {
                              play('click');
                              setCell(next);
                              onChange({ cell: next });
                          }
                }
                cellLabel={([r, c]) => `الصف ${r + 1}، العمود ${c + 1}`}
            />
        </div>
    );
}
