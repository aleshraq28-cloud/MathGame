import { WORLD_THEMES, WorldScenery } from '@/components/art/world-scenery';
import { StageNode } from '@/components/game/stage-node';
import { useElementWidth } from '@/hooks/use-element-width';
import { usePreferences } from '@/hooks/use-preferences';
import type { MapStage, World, Worlds } from '@/types';

type Point = { x: number; y: number };

const ROW_HEIGHT = 178;
const TOP_PADDING = 66;

/**
 * Lays nodes out along a winding route. Narrow screens get a vertical zig-zag
 * (one node per row); wider screens get a right-to-left "snake" of rows.
 */
function layout(
    count: number,
    width: number,
): { points: Point[]; height: number } {
    if (count === 0 || width === 0) {
        return { points: [], height: 0 };
    }

    if (width < 560 || count === 1) {
        const lanes = count === 1 ? [0.5] : [0.7, 0.32, 0.68, 0.3];

        return {
            points: Array.from({ length: count }, (_, i) => ({
                x: width * lanes[i % lanes.length],
                y: TOP_PADDING + i * ROW_HEIGHT,
            })),
            height: TOP_PADDING + count * ROW_HEIGHT - 30,
        };
    }

    const cols = width < 900 ? 3 : 4;
    const rows = Math.ceil(count / cols);
    const cell = width / cols;

    const points = Array.from({ length: count }, (_, i) => {
        const row = Math.floor(i / cols);
        const inRow = i % cols;
        const itemsInRow = Math.min(cols, count - row * cols);
        const offset = ((cols - itemsInRow) * cell) / 2;
        const fromRight = row % 2 === 0;
        const x = fromRight
            ? width - offset - (inRow + 0.5) * cell
            : offset + (inRow + 0.5) * cell;

        return { x, y: TOP_PADDING + row * ROW_HEIGHT + (inRow % 2) * 22 };
    });

    return { points, height: TOP_PADDING + rows * ROW_HEIGHT };
}

function segment(a: Point, b: Point): string {
    const dy = b.y - a.y;

    if (Math.abs(dy) < 40) {
        const mx = (a.x + b.x) / 2;

        return `M${a.x} ${a.y} Q${mx} ${Math.min(a.y, b.y) - 36} ${b.x} ${b.y}`;
    }

    return `M${a.x} ${a.y} C${a.x} ${a.y + dy * 0.55} ${b.x} ${b.y - dy * 0.55} ${b.x} ${b.y}`;
}

function WorldSection({
    number,
    world,
    stages,
}: {
    number: number;
    world: World;
    stages: MapStage[];
}) {
    const [ref, width] = useElementWidth<HTMLDivElement>();
    const { n } = usePreferences();
    const theme = WORLD_THEMES[world.theme] ?? WORLD_THEMES.forest;
    const { points, height } = layout(stages.length, width);
    const done = stages.filter((s) => s.status === 'completed').length;

    return (
        <section
            className={`relative overflow-hidden rounded-[2rem] border-4 border-white/80 shadow-lg ${theme.panel}`}
            aria-labelledby={`world-${number}`}
        >
            <WorldScenery theme={world.theme} />
            <header className="relative z-10 flex flex-wrap items-center gap-x-3 gap-y-1 px-4 pt-4 sm:px-6">
                <span
                    className={`rounded-full px-3 py-0.5 text-sm font-extrabold text-white ${theme.chip}`}
                >
                    {number === 6 ? 'النهاية' : `العالم ${n(number)}`}
                </span>
                <h2
                    id={`world-${number}`}
                    className={`text-xl font-extrabold sm:text-2xl ${theme.header}`}
                >
                    {world.name}
                </h2>
                <p className="w-full text-sm font-semibold text-slate-600 sm:w-auto sm:text-base">
                    {world.tagline}
                </p>
                <span className="ms-auto text-sm font-bold text-slate-600">
                    <bdi className="math-ltr">
                        {n(`${done}/${stages.length}`)}
                    </bdi>{' '}
                    مكتملة
                </span>
            </header>
            <div
                ref={ref}
                className="relative z-10 mx-2 sm:mx-6"
                style={{ height: Math.max(height, 200) }}
            >
                {width > 0 && (
                    <>
                        <svg
                            className="absolute inset-0 size-full overflow-visible"
                            aria-hidden="true"
                        >
                            {points.slice(1).map((p, i) => {
                                const d = segment(points[i], p);
                                const travelled =
                                    stages[i + 1].status !== 'locked';

                                return (
                                    <g key={i}>
                                        <path
                                            d={d}
                                            stroke="#fff7e6"
                                            strokeWidth={22}
                                            fill="none"
                                            strokeLinecap="round"
                                            opacity={0.9}
                                        />
                                        <path
                                            d={d}
                                            stroke={
                                                travelled
                                                    ? theme.path
                                                    : '#94a3b8'
                                            }
                                            strokeWidth={5}
                                            fill="none"
                                            strokeLinecap="round"
                                            strokeDasharray={
                                                travelled ? undefined : '2 12'
                                            }
                                        />
                                    </g>
                                );
                            })}
                        </svg>
                        {stages.map((stage, i) => (
                            <StageNode
                                key={stage.id}
                                stage={stage}
                                x={points[i].x}
                                y={points[i].y}
                                accent={theme.path}
                            />
                        ))}
                    </>
                )}
            </div>
        </section>
    );
}

export function TreasureMap({
    stages,
    worlds,
}: {
    stages: MapStage[];
    worlds: Worlds;
}) {
    const groups = Object.entries(worlds)
        .map(([number, world]) => ({
            number: Number(number),
            world,
            stages: stages.filter((s) => s.world_number === Number(number)),
        }))
        .filter((g) => g.stages.length > 0);

    return (
        <div className="flex flex-col gap-0">
            {groups.map((group, i) => (
                <div key={group.number}>
                    {i > 0 && (
                        <div
                            className="flex justify-center py-1"
                            aria-hidden="true"
                        >
                            <svg viewBox="0 0 40 46" className="h-11">
                                <path
                                    d="M20 0v46"
                                    stroke="#8a5a2b"
                                    strokeWidth="5"
                                    strokeDasharray="3 8"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </div>
                    )}
                    <WorldSection
                        number={group.number}
                        world={group.world}
                        stages={group.stages}
                    />
                </div>
            ))}
        </div>
    );
}
