import { useId } from 'react';
import type { ReactNode } from 'react';
import { ObjectIcon, OBJECT_NAMES } from '@/components/art/object-icon';
import { usePreferences } from '@/hooks/use-preferences';
import { cn } from '@/lib/utils';

const INK = '#1f3b4d';

export function formatTime(hour: number, minute: number): string {
    return `${hour}:${String(minute).padStart(2, '0')}`;
}

/** Analog clock face. `children` lets interactive callers add drag handles. */
export function ClockFace({
    hour,
    minute,
    className,
    children,
    label,
}: {
    hour: number;
    minute: number;
    className?: string;
    children?: ReactNode;
    label?: string;
}) {
    const { n } = usePreferences();
    const minuteAngle = minute * 6;
    const hourAngle = (hour % 12) * 30 + minute * 0.5;

    return (
        <svg
            viewBox="0 0 200 200"
            className={cn('size-44', className)}
            role="img"
            aria-label={label ?? `ساعة تشير إلى ${formatTime(hour, minute)}`}
        >
            <circle
                cx="100"
                cy="100"
                r="94"
                fill="#fff"
                stroke="#f5b700"
                strokeWidth="9"
            />
            <circle cx="100" cy="100" r="88" fill="#fffdf5" />
            {Array.from({ length: 60 }, (_, i) => {
                const a = (i * 6 * Math.PI) / 180;
                const major = i % 5 === 0;
                const r1 = major ? 76 : 81;

                return (
                    <line
                        key={i}
                        x1={100 + r1 * Math.sin(a)}
                        y1={100 - r1 * Math.cos(a)}
                        x2={100 + 86 * Math.sin(a)}
                        y2={100 - 86 * Math.cos(a)}
                        stroke={INK}
                        strokeWidth={major ? 3 : 1.2}
                    />
                );
            })}
            {Array.from({ length: 12 }, (_, i) => {
                const num = i + 1;
                const a = (num * 30 * Math.PI) / 180;

                return (
                    <text
                        key={num}
                        x={100 + 62 * Math.sin(a)}
                        y={100 - 62 * Math.cos(a) + 7}
                        textAnchor="middle"
                        fontSize="20"
                        fontWeight="800"
                        fill={INK}
                    >
                        {n(num)}
                    </text>
                );
            })}
            <line
                x1="100"
                y1="100"
                x2={100 + 42 * Math.sin((hourAngle * Math.PI) / 180)}
                y2={100 - 42 * Math.cos((hourAngle * Math.PI) / 180)}
                stroke="#f4623a"
                strokeWidth="8"
                strokeLinecap="round"
            />
            <line
                x1="100"
                y1="100"
                x2={100 + 68 * Math.sin((minuteAngle * Math.PI) / 180)}
                y2={100 - 68 * Math.cos((minuteAngle * Math.PI) / 180)}
                stroke="#0b6e96"
                strokeWidth="5"
                strokeLinecap="round"
            />
            {children}
            <circle cx="100" cy="100" r="7" fill={INK} />
        </svg>
    );
}

export function DigitalClock({
    hour,
    minute,
}: {
    hour: number;
    minute: number;
}) {
    const { n } = usePreferences();

    return (
        <div
            className="inline-flex rounded-2xl border-4 border-slate-600 bg-slate-800 px-6 py-3 shadow-lg"
            role="img"
            aria-label={`ساعة رقمية تعرض ${formatTime(hour, minute)}`}
        >
            <span className="math-ltr font-mono text-5xl font-bold tracking-widest text-lime-300">
                {n(formatTime(hour, minute))}
            </span>
        </div>
    );
}

const NOTE_COLORS: Record<number, string> = {
    1: '#a7f3d0',
    5: '#fecaca',
    10: '#bfdbfe',
    20: '#fde68a',
    50: '#ddd6fe',
};

export function MoneyPiece({
    value,
    unit,
    className,
}: {
    value: number;
    unit: string;
    className?: string;
}) {
    const { n } = usePreferences();

    if (unit === 'ريال') {
        return (
            <span
                className={cn(
                    'relative inline-flex h-14 w-24 flex-col items-center justify-center rounded-md border-2 border-emerald-800/40 shadow-sm',
                    className,
                )}
                style={{ background: NOTE_COLORS[value] ?? '#d9f99d' }}
            >
                <span
                    className="absolute inset-1 rounded border border-dashed border-emerald-800/30"
                    aria-hidden="true"
                />
                <span className="text-xl leading-none font-extrabold text-emerald-900">
                    {n(value)}
                </span>
                <span className="text-xs font-bold text-emerald-900">ريال</span>
            </span>
        );
    }

    const copper = value <= 10;
    const size =
        value >= 100
            ? 'size-16'
            : value >= 50
              ? 'size-[3.75rem]'
              : value >= 25
                ? 'size-14'
                : 'size-12';

    return (
        <span
            className={cn(
                'inline-flex flex-col items-center justify-center rounded-full border-4 shadow-[inset_0_-3px_0_rgb(0_0_0_/_0.15)]',
                copper
                    ? 'border-amber-700 bg-amber-400 text-amber-950'
                    : 'border-slate-400 bg-slate-200 text-slate-800',
                size,
                className,
            )}
        >
            <span className="text-lg leading-none font-extrabold">
                {n(value)}
            </span>
            <span className="text-[0.6rem] leading-none font-bold">بيسة</span>
        </span>
    );
}

export function CoinsVisual({
    coins,
    unit,
}: {
    coins: number[];
    unit: string;
}) {
    return (
        <div
            className="flex flex-wrap items-center justify-center gap-2"
            role="img"
            aria-label={`نقود: ${coins.join(' و')} ${unit}`}
        >
            {coins.map((value, i) => (
                <MoneyPiece key={i} value={value} unit={unit} />
            ))}
        </div>
    );
}

export function PricesVisual({
    items,
    unit,
}: {
    items: { icon: string; label: string; price: number }[];
    unit: string;
}) {
    const { n } = usePreferences();

    return (
        <ul className="flex flex-wrap justify-center gap-3">
            {items.map((item, i) => (
                <li
                    key={i}
                    className="flex w-28 flex-col items-center rounded-2xl border-2 border-sand-400 bg-white p-2 text-center shadow-sm"
                >
                    <ObjectIcon name={item.icon} className="size-12" />
                    <span className="text-base font-bold text-slate-700">
                        {item.label}
                    </span>
                    <span className="mt-1 rounded-full bg-sun-300 px-2.5 text-base font-extrabold text-bark-800">
                        {n(item.price)} {unit}
                    </span>
                </li>
            ))}
        </ul>
    );
}

const BAR_COLORS: Record<string, string> = {
    red: '#ef4444',
    blue: '#3b82f6',
    green: '#22c55e',
    yellow: '#eab308',
    orange: '#f97316',
    purple: '#a855f7',
};
const DEFAULT_BARS = ['#f4623a', '#0ea5d8', '#22b35e', '#a855f7', '#f5b700'];

export function BarsVisual({
    bars,
    unit,
    style,
}: {
    bars: { label: string; value: number; color?: string }[];
    unit: string;
    style: 'rope' | 'chart';
}) {
    const { n } = usePreferences();
    const max = Math.max(...bars.map((b) => b.value));

    if (style === 'rope') {
        return (
            <ul className="flex w-full max-w-md flex-col gap-3">
                {bars.map((bar, i) => (
                    <li key={i} className="flex items-center gap-3">
                        <span className="w-28 shrink-0 text-base font-bold text-slate-700">
                            {bar.label}
                        </span>
                        <span dir="ltr" className="flex flex-1">
                            <span
                                className="h-3.5 rounded-full"
                                style={{
                                    width: `${(bar.value / max) * 100}%`,
                                    background: `repeating-linear-gradient(45deg, ${BAR_COLORS[bar.color ?? ''] ?? DEFAULT_BARS[i % 5]} 0 6px, rgb(0 0 0 / 0.18) 6px 8px)`,
                                }}
                                role="img"
                                aria-label={`${bar.label}: ${bar.value} ${unit}`}
                            />
                        </span>
                        <span className="w-12 shrink-0 text-base font-extrabold text-slate-700">
                            {n(bar.value)} {unit}
                        </span>
                    </li>
                ))}
            </ul>
        );
    }

    const tick = max <= 10 ? 1 : max <= 20 ? 2 : 5;
    const top = Math.ceil(max / tick) * tick;
    const gridValues = Array.from(
        { length: top / tick + 1 },
        (_, i) => i * tick,
    );
    const chartH = 160;
    const y = (v: number) => 10 + chartH - (v / top) * chartH;
    const colW = 260 / bars.length;

    return (
        <svg
            viewBox="0 0 300 220"
            className="w-full max-w-md"
            role="img"
            aria-label={`مخطط أعمدة بوحدة ${unit}`}
            direction="ltr"
        >
            {gridValues.map((v) => (
                <g key={v}>
                    <line
                        x1="34"
                        x2="296"
                        y1={y(v)}
                        y2={y(v)}
                        stroke="#cbd5e1"
                        strokeWidth="1"
                    />
                    <text
                        x="28"
                        y={y(v) + 4}
                        textAnchor="end"
                        fontSize="11"
                        fontWeight="700"
                        fill={INK}
                    >
                        {n(v)}
                    </text>
                </g>
            ))}
            <line
                x1="34"
                x2="34"
                y1="10"
                y2={y(0)}
                stroke={INK}
                strokeWidth="2"
            />
            <line
                x1="34"
                x2="296"
                y1={y(0)}
                y2={y(0)}
                stroke={INK}
                strokeWidth="2"
            />
            {bars.map((bar, i) => {
                const x = 36 + i * colW + colW * 0.2;

                return (
                    <g key={i}>
                        <rect
                            x={x}
                            y={y(bar.value)}
                            width={colW * 0.6}
                            height={y(0) - y(bar.value)}
                            rx="3"
                            fill={
                                BAR_COLORS[bar.color ?? ''] ??
                                DEFAULT_BARS[i % 5]
                            }
                        />
                        <text
                            x={x + colW * 0.3}
                            y={y(0) + 17}
                            textAnchor="middle"
                            fontSize="12"
                            fontWeight="700"
                            fill={INK}
                            direction="rtl"
                        >
                            {bar.label}
                        </text>
                    </g>
                );
            })}
            <text
                x="6"
                y="8"
                fontSize="11"
                fontWeight="700"
                fill={INK}
                direction="rtl"
            >
                {unit}
            </text>
        </svg>
    );
}

export function RulerVisual({
    length,
    object,
}: {
    length: number;
    object: string;
}) {
    const { n } = usePreferences();
    const cm = Math.max(10, length + 2);
    const unitW = 280 / cm;
    const x0 = 14;

    return (
        <svg
            viewBox="0 0 310 110"
            className="w-full max-w-lg"
            role="img"
            aria-label={`${OBJECT_NAMES[object] ?? 'شيء'} فوق مسطرة بالسنتيمترات`}
            direction="ltr"
        >
            {object === 'pencil' ? (
                <g>
                    <rect
                        x={x0}
                        y="18"
                        width={length * unitW - 18}
                        height="16"
                        fill="#facc15"
                        stroke={INK}
                        strokeWidth="1.5"
                    />
                    <rect
                        x={x0}
                        y="18"
                        width="10"
                        height="16"
                        fill="#fda4af"
                        stroke={INK}
                        strokeWidth="1.5"
                    />
                    <path
                        d={`M${x0 + length * unitW - 18} 18L${x0 + length * unitW} 26L${x0 + length * unitW - 18} 34z`}
                        fill="#fde68a"
                        stroke={INK}
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                    />
                    <path
                        d={`M${x0 + length * unitW - 6} 23.3L${x0 + length * unitW} 26L${x0 + length * unitW - 6} 28.7z`}
                        fill={INK}
                    />
                </g>
            ) : (
                <rect
                    x={x0}
                    y="16"
                    width={length * unitW}
                    height="20"
                    rx="4"
                    fill="#93c5fd"
                    stroke={INK}
                    strokeWidth="1.5"
                />
            )}
            <rect
                x="4"
                y="46"
                width="300"
                height="56"
                rx="6"
                fill="#fef3c7"
                stroke="#b45309"
                strokeWidth="2"
            />
            {Array.from({ length: cm * 2 + 1 }, (_, i) => {
                const x = x0 + (i / 2) * unitW;
                const whole = i % 2 === 0;

                return (
                    <g key={i}>
                        <line
                            x1={x}
                            y1="46"
                            x2={x}
                            y2={whole ? 64 : 56}
                            stroke={INK}
                            strokeWidth={whole ? 1.8 : 1}
                        />
                        {whole && (
                            <text
                                x={x}
                                y="82"
                                textAnchor="middle"
                                fontSize="12"
                                fontWeight="700"
                                fill={INK}
                            >
                                {n(i / 2)}
                            </text>
                        )}
                    </g>
                );
            })}
            <text
                x="296"
                y="97"
                textAnchor="end"
                fontSize="10"
                fontWeight="700"
                fill="#92400e"
                direction="rtl"
            >
                سم
            </text>
        </svg>
    );
}

export function ScaleVisual({
    value,
    max,
    unit,
    icon,
}: {
    value: number;
    max: number;
    unit: string;
    icon: string;
}) {
    const { n } = usePreferences();
    const angle = (v: number) => (-120 + (v / max) * 240) * (Math.PI / 180);

    return (
        <div
            className="flex flex-col items-center"
            role="img"
            aria-label={`ميزان عليه ${OBJECT_NAMES[icon] ?? 'فاكهة'} ومؤشر أحمر`}
        >
            <div className="relative z-10 -mb-3 flex h-12 w-40 items-end justify-center rounded-t-[50%] border-b-8 border-slate-500">
                {Array.from({ length: 4 }, (_, i) => (
                    <ObjectIcon key={i} name={icon} className="-mx-1 size-10" />
                ))}
            </div>
            <svg viewBox="0 0 180 160" className="w-48" direction="ltr">
                <rect
                    x="10"
                    y="6"
                    width="160"
                    height="150"
                    rx="22"
                    fill="#e2e8f0"
                    stroke="#64748b"
                    strokeWidth="3"
                />
                <circle
                    cx="90"
                    cy="86"
                    r="64"
                    fill="#fff"
                    stroke={INK}
                    strokeWidth="2.5"
                />
                {Array.from({ length: max + 1 }, (_, v) => {
                    const a = angle(v);

                    return (
                        <g key={v}>
                            <line
                                x1={90 + 54 * Math.sin(a)}
                                y1={86 - 54 * Math.cos(a)}
                                x2={90 + 62 * Math.sin(a)}
                                y2={86 - 62 * Math.cos(a)}
                                stroke={INK}
                                strokeWidth="2"
                            />
                            <text
                                x={90 + 43 * Math.sin(a)}
                                y={86 - 43 * Math.cos(a) + 5}
                                textAnchor="middle"
                                fontSize="13"
                                fontWeight="800"
                                fill={INK}
                            >
                                {n(v)}
                            </text>
                        </g>
                    );
                })}
                <line
                    x1="90"
                    y1="86"
                    x2={90 + 56 * Math.sin(angle(value))}
                    y2={86 - 56 * Math.cos(angle(value))}
                    stroke="#dc2626"
                    strokeWidth="4"
                    strokeLinecap="round"
                />
                <circle cx="90" cy="86" r="6" fill="#dc2626" />
                <text
                    x="90"
                    y="128"
                    textAnchor="middle"
                    fontSize="14"
                    fontWeight="800"
                    fill={INK}
                    direction="rtl"
                >
                    {unit}
                </text>
            </svg>
        </div>
    );
}

export function JarVisual({ fill }: { fill: number; capacity: number }) {
    const clipId = `jar${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
    const marbles: { x: number; y: number; c: string }[] = [];
    const colors = [
        '#f43f5e',
        '#3b82f6',
        '#22c55e',
        '#eab308',
        '#a855f7',
        '#f97316',
    ];
    const bottom = 168;
    const height = 120 * fill;
    let k = 0;

    for (let row = 0; row * 11 < height; row++) {
        for (let col = 0; col < 8; col++) {
            marbles.push({
                x: 34 + col * 11 + (row % 2) * 5.5,
                y: bottom - 6 - row * 10,
                c: colors[(k++ * 7) % colors.length],
            });
        }
    }

    return (
        <svg
            viewBox="0 0 150 180"
            className="h-44 w-auto"
            role="img"
            aria-label={
                fill >= 0.45 && fill <= 0.55
                    ? 'وعاء مملوء إلى المنتصف تقريباً بكرات زجاجية'
                    : 'وعاء فيه كرات زجاجية'
            }
        >
            <defs>
                <clipPath id={clipId}>
                    <path d="M30 40h90v120a12 12 0 0 1-12 12H42a12 12 0 0 1-12-12z" />
                </clipPath>
            </defs>
            <rect x="40" y="18" width="70" height="16" rx="4" fill="#a16207" />
            <g clipPath={`url(#${clipId})`}>
                {marbles.map((m, i) => (
                    <circle
                        key={i}
                        cx={m.x}
                        cy={m.y}
                        r="5"
                        fill={m.c}
                        stroke="#0f172a"
                        strokeWidth="0.5"
                    />
                ))}
            </g>
            <path
                d="M30 40h90v120a12 12 0 0 1-12 12H42a12 12 0 0 1-12-12z"
                fill="rgb(186 230 253 / 0.25)"
                stroke="#0b6e96"
                strokeWidth="3"
            />
            <line
                x1="124"
                y1={bottom - 60}
                x2="134"
                y2={bottom - 60}
                stroke="#0b6e96"
                strokeWidth="2"
            />
            <line
                x1="124"
                y1={bottom - 120}
                x2="134"
                y2={bottom - 120}
                stroke="#0b6e96"
                strokeWidth="2"
            />
        </svg>
    );
}

export type GridCell = [number, number];

const key = (c: GridCell) => `${c[0]}:${c[1]}`;

/**
 * Compass grid. North is up and east is right (rendered LTR on purpose so the
 * directions match the textbook maps even inside the RTL page).
 */
export function GridBoard({
    rows,
    cols,
    start,
    target,
    obstacles = [],
    path = [],
    marked = [],
    explorer,
    onCellClick,
    cellLabel,
    size = 'md',
}: {
    rows: number;
    cols: number;
    start?: GridCell | null;
    target?: GridCell | null;
    obstacles?: GridCell[];
    path?: GridCell[];
    marked?: GridCell[];
    explorer?: GridCell | null;
    onCellClick?: (cell: GridCell) => void;
    cellLabel?: (cell: GridCell) => string;
    size?: 'sm' | 'md';
}) {
    const blocked = new Set(obstacles.map(key));
    const onPath = new Set(path.map(key));
    const isMarked = new Set(marked.map(key));
    const explorerAt = explorer ?? start ?? null;
    const cellSize =
        size === 'sm' ? 'size-10 sm:size-11' : 'size-12 sm:size-14';

    return (
        <div className="inline-flex flex-col items-center gap-1" dir="ltr">
            <span className="text-sm font-extrabold text-sea-700">⬆ شمال</span>
            <div className="flex items-center gap-1">
                <span className="rotate-180 text-sm font-extrabold text-sea-700 [writing-mode:vertical-rl]">
                    غرب
                </span>
                <div
                    className="grid gap-1 rounded-2xl bg-leaf-700/80 p-1.5"
                    style={{
                        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                    }}
                >
                    {Array.from({ length: rows * cols }, (_, i) => {
                        const cell: GridCell = [Math.floor(i / cols), i % cols];
                        const k = key(cell);
                        const isExplorer =
                            explorerAt !== null && key(explorerAt) === k;
                        const isTarget = target && key(target) === k;
                        const content = (
                            <>
                                {blocked.has(k) && (
                                    <svg
                                        viewBox="0 0 40 40"
                                        className="size-4/5"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M6 32l6-14 8-6 10 4 5 16z"
                                            fill="#78716c"
                                            stroke="#292524"
                                            strokeWidth="1.5"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                )}
                                {isTarget && !isExplorer && (
                                    <svg
                                        viewBox="0 0 40 40"
                                        className="size-4/5"
                                        aria-hidden="true"
                                    >
                                        <rect
                                            x="6"
                                            y="16"
                                            width="28"
                                            height="18"
                                            rx="3"
                                            fill="#b45309"
                                            stroke="#451a03"
                                            strokeWidth="1.5"
                                        />
                                        <path
                                            d="M6 18a14 10 0 0 1 28 0z"
                                            fill="#d97706"
                                            stroke="#451a03"
                                            strokeWidth="1.5"
                                        />
                                        <rect
                                            x="17"
                                            y="18"
                                            width="6"
                                            height="7"
                                            rx="1"
                                            fill="#fde047"
                                        />
                                    </svg>
                                )}
                                {isExplorer && (
                                    <svg
                                        viewBox="0 0 40 40"
                                        className="size-4/5"
                                        aria-hidden="true"
                                    >
                                        <circle
                                            cx="20"
                                            cy="12"
                                            r="7"
                                            fill="#fcd9b6"
                                            stroke="#7c2d12"
                                            strokeWidth="1.5"
                                        />
                                        <path
                                            d="M11 9h18l-3-5H14z"
                                            fill="#a16207"
                                        />
                                        <path
                                            d="M10 36c0-10 4-15 10-15s10 5 10 15z"
                                            fill="#0ea5d8"
                                            stroke="#0b3a55"
                                            strokeWidth="1.5"
                                        />
                                    </svg>
                                )}
                            </>
                        );
                        const className = cn(
                            'flex items-center justify-center rounded-lg transition-colors',
                            cellSize,
                            blocked.has(k) ? 'bg-stone-300' : 'bg-leaf-100',
                            onPath.has(k) && 'bg-sun-300',
                            isMarked.has(k) &&
                                'bg-coral-400 ring-4 ring-coral-500',
                        );

                        return onCellClick ? (
                            <button
                                key={k}
                                type="button"
                                className={cn(
                                    className,
                                    'hover:ring-4 hover:ring-sun-400 focus-visible:z-10',
                                )}
                                onClick={() => onCellClick(cell)}
                                aria-label={cellLabel?.(cell)}
                                aria-pressed={isMarked.has(k)}
                            >
                                {content}
                            </button>
                        ) : (
                            <div key={k} className={className}>
                                {content}
                            </div>
                        );
                    })}
                </div>
                <span className="text-sm font-extrabold text-sea-700 [writing-mode:vertical-rl]">
                    شرق
                </span>
            </div>
            <span className="text-sm font-extrabold text-sea-700">جنوب ⬇</span>
        </div>
    );
}
