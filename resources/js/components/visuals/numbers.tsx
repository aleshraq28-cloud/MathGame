import { ObjectIcon, OBJECT_NAMES } from '@/components/art/object-icon';
import { usePreferences } from '@/hooks/use-preferences';
import { cn } from '@/lib/utils';

export function HundredFlat({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 50 50"
            className={cn('size-14', className)}
            aria-hidden="true"
        >
            <rect
                x="0.5"
                y="0.5"
                width="49"
                height="49"
                rx="2"
                fill="#60a5fa"
                stroke="#1e3a8a"
            />
            {Array.from({ length: 9 }, (_, i) => (
                <g key={i} stroke="#1e3a8a" strokeWidth="0.4" opacity="0.7">
                    <line x1={(i + 1) * 5} y1="0" x2={(i + 1) * 5} y2="50" />
                    <line x1="0" y1={(i + 1) * 5} x2="50" y2={(i + 1) * 5} />
                </g>
            ))}
        </svg>
    );
}

export function TenRod({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 6 50"
            className={cn('h-14 w-[7px]', className)}
            aria-hidden="true"
        >
            <rect
                x="0.5"
                y="0.5"
                width="5"
                height="49"
                rx="1"
                fill="#4ade80"
                stroke="#14532d"
                strokeWidth="0.6"
            />
            {Array.from({ length: 9 }, (_, i) => (
                <line
                    key={i}
                    x1="0"
                    y1={(i + 1) * 5}
                    x2="6"
                    y2={(i + 1) * 5}
                    stroke="#14532d"
                    strokeWidth="0.4"
                />
            ))}
        </svg>
    );
}

export function OneCube({ className }: { className?: string }) {
    return (
        <span
            className={cn(
                'inline-block size-[9px] rounded-[2px] border border-orange-800 bg-orange-400',
                className,
            )}
            aria-hidden="true"
        />
    );
}

export function BlocksVisual({
    hundreds,
    tens,
    ones,
}: {
    hundreds: number;
    tens: number;
    ones: number;
}) {
    return (
        <div
            dir="ltr"
            className="flex flex-wrap items-end justify-center gap-4"
            role="img"
            aria-label={`${hundreds} مئات و${tens} عشرات و${ones} آحاد من قطع الأعداد`}
        >
            {hundreds > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {Array.from({ length: hundreds }, (_, i) => (
                        <HundredFlat key={i} />
                    ))}
                </div>
            )}
            {tens > 0 && (
                <div className="flex gap-1">
                    {Array.from({ length: tens }, (_, i) => (
                        <TenRod key={i} />
                    ))}
                </div>
            )}
            {ones > 0 && (
                <div className="grid grid-cols-5 gap-1">
                    {Array.from({ length: ones }, (_, i) => (
                        <OneCube key={i} />
                    ))}
                </div>
            )}
        </div>
    );
}

export function AbacusVisual({
    hundreds,
    tens,
    ones,
}: {
    hundreds: number;
    tens: number;
    ones: number;
}) {
    const rods = [
        { label: 'م', count: hundreds, color: '#3b82f6' },
        { label: 'ع', count: tens, color: '#22c55e' },
        { label: 'آ', count: ones, color: '#f97316' },
    ];

    return (
        <svg
            viewBox="0 0 150 130"
            className="h-40 w-auto"
            role="img"
            aria-label={`معداد عليه ${hundreds} خرزات في المئات و${tens} في العشرات و${ones} في الآحاد`}
            direction="ltr"
        >
            <rect x="8" y="100" width="134" height="14" rx="4" fill="#a16207" />
            {rods.map((rod, i) => {
                const x = 30 + i * 45;

                return (
                    <g key={rod.label}>
                        <line
                            x1={x}
                            y1="8"
                            x2={x}
                            y2="100"
                            stroke="#78716c"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />
                        {Array.from({ length: rod.count }, (_, b) => (
                            <ellipse
                                key={b}
                                cx={x}
                                cy={93 - b * 9.4}
                                rx="14"
                                ry="4.6"
                                fill={rod.color}
                                stroke="#1f2937"
                                strokeWidth="0.8"
                            />
                        ))}
                        <text
                            x={x}
                            y="126"
                            textAnchor="middle"
                            fontSize="13"
                            fontWeight="800"
                            fill="#fff"
                        >
                            {rod.label}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}

export function CardsVisual({ digits }: { digits: number[] }) {
    const { n } = usePreferences();

    return (
        <div
            className="flex flex-wrap justify-center gap-3"
            role="img"
            aria-label={`بطاقات الأرقام: ${digits.join('، ')}`}
        >
            {digits.map((d, i) => (
                <span
                    key={i}
                    className="flex h-20 w-16 items-center justify-center rounded-2xl border-4 border-sea-500 bg-white text-4xl font-extrabold text-sea-700 shadow-[0_5px_0_rgb(11_110_150_/_0.25)]"
                    style={{ rotate: `${(i % 2 ? 1 : -1) * 3}deg` }}
                >
                    {n(d)}
                </span>
            ))}
        </div>
    );
}

export function ArrayVisual({
    rows,
    cols,
    icon,
}: {
    rows: number;
    cols: number;
    icon: string;
}) {
    return (
        <div
            dir="ltr"
            className="inline-grid gap-1 rounded-2xl bg-white/70 p-2 sm:gap-1.5"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            role="img"
            aria-label={`${rows} صفوف في كل صف ${cols} ${OBJECT_NAMES[icon] ?? ''}`}
        >
            {Array.from({ length: rows * cols }, (_, i) => (
                <ObjectIcon key={i} name={icon} className="size-7 sm:size-8" />
            ))}
        </div>
    );
}

export function GroupsVisual({
    groups,
    per_group,
    icon,
    container,
}: {
    groups: number;
    per_group: number;
    icon: string;
    container: string;
}) {
    return (
        <div
            className="flex flex-wrap justify-center gap-3"
            role="img"
            aria-label={`${groups} مجموعات في كل مجموعة ${per_group} ${OBJECT_NAMES[icon] ?? ''}`}
        >
            {Array.from({ length: groups }, (_, g) => (
                <div
                    key={g}
                    className={cn(
                        'flex max-w-[8.5rem] flex-wrap items-center justify-center gap-0.5 p-2.5',
                        container === 'box'
                            ? 'rounded-lg border-4 border-amber-700 bg-amber-100'
                            : 'rounded-full border-4 border-slate-300 bg-white shadow-inner',
                    )}
                >
                    {Array.from({ length: per_group }, (_, i) => (
                        <ObjectIcon
                            key={i}
                            name={icon}
                            className="size-6 sm:size-7"
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

export function ObjectsVisual({
    items,
}: {
    items: { icon: string; count: number }[];
}) {
    const label = items
        .map((it) => `${it.count} ${OBJECT_NAMES[it.icon] ?? ''}`)
        .join(' و');

    return (
        <div
            className="flex flex-wrap justify-center gap-4"
            role="img"
            aria-label={label}
        >
            {items.map((item, k) => (
                <div
                    key={k}
                    dir="ltr"
                    className="flex max-w-[16rem] flex-wrap justify-center gap-1 rounded-2xl bg-white/70 p-2"
                >
                    {Array.from({ length: item.count }, (_, i) => (
                        <ObjectIcon
                            key={i}
                            name={item.icon}
                            className={cn(
                                'size-7 sm:size-8',
                                i % 5 === 4 && 'me-1.5',
                            )}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

export function NumberLineVisual({
    start,
    end,
    step,
    pointer,
    label_all,
}: {
    start: number;
    end: number;
    step: number;
    pointer: number | null;
    label_all: boolean;
}) {
    const { n } = usePreferences();
    const ticks = Math.round((end - start) / step);
    const width = 320;
    const pad = 22;
    const x = (value: number) =>
        pad + ((value - start) / (end - start)) * (width - pad * 2);

    return (
        <svg
            viewBox={`0 0 ${width} 74`}
            className="w-full max-w-xl"
            role="img"
            aria-label={`خط أعداد من ${start} إلى ${end}${pointer !== null ? ' عليه سهم يشير إلى عدد' : ''}`}
        >
            <line
                x1={pad - 10}
                y1="40"
                x2={width - pad + 10}
                y2="40"
                stroke="#1f3b4d"
                strokeWidth="2.5"
                strokeLinecap="round"
            />
            <path d={`M${pad - 14} 40l7-5v10z`} fill="#1f3b4d" />
            <path d={`M${width - pad + 14} 40l-7-5v10z`} fill="#1f3b4d" />
            {Array.from({ length: ticks + 1 }, (_, i) => {
                const value = start + i * step;
                const showLabel =
                    label_all ||
                    i === 0 ||
                    i === ticks ||
                    (ticks > 5 && i === ticks / 2);

                return (
                    <g key={i}>
                        <line
                            x1={x(value)}
                            y1="32"
                            x2={x(value)}
                            y2="48"
                            stroke="#1f3b4d"
                            strokeWidth="2"
                        />
                        {showLabel && (
                            <text
                                x={x(value)}
                                y="68"
                                textAnchor="middle"
                                fontSize="13"
                                fontWeight="700"
                                fill="#1f3b4d"
                            >
                                {n(value)}
                            </text>
                        )}
                    </g>
                );
            })}
            {pointer !== null && (
                <g>
                    <path
                        d={`M${x(pointer)} 30l-7-14h14z`}
                        fill="#f4623a"
                        stroke="#9a3412"
                        strokeWidth="1.2"
                    />
                    {!label_all && (
                        <text
                            x={x(pointer)}
                            y="11"
                            textAnchor="middle"
                            fontSize="13"
                            fontWeight="800"
                            fill="#f4623a"
                        >
                            ؟
                        </text>
                    )}
                </g>
            )}
        </svg>
    );
}
