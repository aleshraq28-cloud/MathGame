import { cn } from '@/lib/utils';
import type { Cell } from '@/types';

const INK = '#1f3b4d';

function regular(sides: number, radius = 40, rotation = -90): string {
    return Array.from({ length: sides }, (_, i) => {
        const angle = ((rotation + (360 / sides) * i) * Math.PI) / 180;

        return `${(50 + radius * Math.cos(angle)).toFixed(1)},${(50 + radius * Math.sin(angle)).toFixed(1)}`;
    }).join(' ');
}

export const SHAPE_NAMES: Record<string, string> = {
    triangle: 'مثلث',
    square: 'مربع',
    rectangle: 'مستطيل',
    pentagon: 'شكل خماسي',
    hexagon: 'شكل سداسي',
    octagon: 'شكل ثماني',
    circle: 'دائرة',
    quadrilateral: 'شكل رباعي',
    scalene: 'مثلث مختلف الأضلاع',
    heart: 'قلب',
    l_shape: 'شكل على هيئة حرف L',
    rhombus: 'معيّن',
};

const SHAPE_COLORS: Record<string, string> = {
    triangle: '#fca5a5',
    square: '#93c5fd',
    rectangle: '#86efac',
    pentagon: '#fcd34d',
    hexagon: '#c4b5fd',
    octagon: '#fdba74',
    circle: '#f9a8d4',
    quadrilateral: '#5eead4',
    scalene: '#fda4af',
    heart: '#fb7185',
    l_shape: '#a5b4fc',
    rhombus: '#67e8f9',
};

export function ShapeOutline({
    shape,
    fill,
    strokeWidth = 3,
}: {
    shape: string;
    fill?: string;
    strokeWidth?: number;
}) {
    const props = {
        fill: fill ?? SHAPE_COLORS[shape] ?? '#bae6fd',
        stroke: INK,
        strokeWidth,
        strokeLinejoin: 'round' as const,
    };

    switch (shape) {
        case 'circle':
            return <circle cx="50" cy="50" r="38" {...props} />;
        case 'square':
            return <rect x="14" y="14" width="72" height="72" {...props} />;
        case 'rectangle':
            return <rect x="4" y="26" width="92" height="48" {...props} />;
        case 'triangle':
            return <polygon points="50,10 92,84 8,84" {...props} />;
        case 'scalene':
            return <polygon points="8,80 94,86 34,16" {...props} />;
        case 'quadrilateral':
            return <polygon points="18,20 86,30 76,82 8,70" {...props} />;
        case 'rhombus':
            return <polygon points="50,6 88,50 50,94 12,50" {...props} />;
        case 'pentagon':
            return <polygon points={regular(5)} {...props} />;
        case 'hexagon':
            return <polygon points={regular(6, 40, 0)} {...props} />;
        case 'octagon':
            return <polygon points={regular(8, 40, 22.5)} {...props} />;
        case 'heart':
            return (
                <path
                    d="M50 86C14 62 6 42 14 26c8-14 28-14 36 4 8-18 28-18 36-4 8 16 0 36-36 60z"
                    {...props}
                />
            );
        case 'l_shape':
            return (
                <polygon
                    points="16,8 44,8 44,62 88,62 88,90 16,90"
                    {...props}
                />
            );
        default:
            return <rect x="14" y="14" width="72" height="72" {...props} />;
    }
}

export function ShapeVisual({
    shape,
    className,
}: {
    shape: string;
    className?: string;
}) {
    return (
        <svg
            viewBox="0 0 100 100"
            className={cn('h-28 w-28', className)}
            role="img"
            aria-label={SHAPE_NAMES[shape] ?? 'شكل'}
        >
            <ShapeOutline shape={shape} />
        </svg>
    );
}

export function ShapesVisual({ shapes }: { shapes: string[] }) {
    return (
        <div
            className="flex flex-wrap items-center justify-center gap-3"
            role="img"
            aria-label={`مجموعة أشكال: ${shapes.map((s) => SHAPE_NAMES[s] ?? s).join('، ')}`}
        >
            {shapes.map((shape, i) => (
                <svg
                    key={i}
                    viewBox="0 0 100 100"
                    className="size-16 sm:size-20"
                    aria-hidden="true"
                >
                    <ShapeOutline shape={shape} />
                </svg>
            ))}
        </div>
    );
}

const AXIS_LINES: Record<
    string,
    Record<string, [number, number, number, number]>
> = {
    square: {
        vertical: [50, 4, 50, 96],
        horizontal: [4, 50, 96, 50],
        diagonal: [14, 14, 86, 86],
    },
    rectangle: {
        vertical: [50, 16, 50, 84],
        horizontal: [0, 50, 100, 50],
        diagonal: [4, 26, 96, 74],
    },
    circle: {
        vertical: [50, 4, 50, 96],
        horizontal: [4, 50, 96, 50],
        diagonal: [18, 18, 82, 82],
    },
    triangle: {
        vertical: [50, 4, 50, 92],
        horizontal: [4, 60, 96, 60],
        diagonal: [8, 84, 71, 47],
    },
};

export function AxisShapeVisual({
    shape,
    line,
}: {
    shape: string;
    line: string;
}) {
    const [x1, y1, x2, y2] = AXIS_LINES[shape]?.[line] ?? [50, 4, 50, 96];

    return (
        <svg
            viewBox="0 0 100 100"
            className="h-32 w-32"
            role="img"
            aria-label={`${SHAPE_NAMES[shape] ?? 'شكل'} مرسوم عليه خط متقطع`}
        >
            <ShapeOutline shape={shape} />
            <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#e11d48"
                strokeWidth="3"
                strokeDasharray="6 5"
                strokeLinecap="round"
            />
        </svg>
    );
}

export const SOLID_NAMES: Record<string, string> = {
    cube: 'مكعب',
    cuboid: 'منشور رباعي',
    square_pyramid: 'هرم رباعي القاعدة',
    triangular_pyramid: 'هرم ثلاثي القاعدة',
    triangular_prism: 'منشور ثلاثي',
    sphere: 'كرة',
    cylinder: 'أسطوانة',
    cone: 'مخروط',
};

export function SolidVisual({
    solid,
    className,
}: {
    solid: string;
    className?: string;
}) {
    const face = {
        stroke: INK,
        strokeWidth: 2.5,
        strokeLinejoin: 'round' as const,
    };
    const hidden = {
        stroke: INK,
        strokeWidth: 1.6,
        strokeDasharray: '4 4',
        fill: 'none',
    };
    let body: React.ReactNode;

    switch (solid) {
        case 'cube':
            body = (
                <>
                    <polygon
                        points="20,38 62,38 62,80 20,80"
                        fill="#93c5fd"
                        {...face}
                    />
                    <polygon
                        points="20,38 38,20 80,20 62,38"
                        fill="#bfdbfe"
                        {...face}
                    />
                    <polygon
                        points="62,38 80,20 80,62 62,80"
                        fill="#60a5fa"
                        {...face}
                    />
                    <polyline points="20,80 38,62 80,62" {...hidden} />
                    <line x1="38" y1="20" x2="38" y2="62" {...hidden} />
                </>
            );
            break;
        case 'cuboid':
            body = (
                <>
                    <polygon
                        points="8,44 70,44 70,84 8,84"
                        fill="#86efac"
                        {...face}
                    />
                    <polygon
                        points="8,44 26,28 88,28 70,44"
                        fill="#bbf7d0"
                        {...face}
                    />
                    <polygon
                        points="70,44 88,28 88,68 70,84"
                        fill="#4ade80"
                        {...face}
                    />
                </>
            );
            break;
        case 'square_pyramid':
            body = (
                <>
                    <polygon
                        points="14,74 60,86 50,14"
                        fill="#fcd34d"
                        {...face}
                    />
                    <polygon
                        points="60,86 88,68 50,14"
                        fill="#f59e0b"
                        {...face}
                    />
                    <polyline points="14,74 42,58 88,68" {...hidden} />
                    <line x1="42" y1="58" x2="50" y2="14" {...hidden} />
                </>
            );
            break;
        case 'triangular_pyramid':
            body = (
                <>
                    <polygon
                        points="12,78 66,88 48,14"
                        fill="#fca5a5"
                        {...face}
                    />
                    <polygon
                        points="66,88 90,64 48,14"
                        fill="#f87171"
                        {...face}
                    />
                    <line x1="12" y1="78" x2="90" y2="64" {...hidden} />
                </>
            );
            break;
        case 'triangular_prism':
            body = (
                <>
                    <polygon
                        points="10,80 30,44 50,80"
                        fill="#c4b5fd"
                        {...face}
                    />
                    <polygon
                        points="30,44 72,24 92,60 50,80"
                        fill="#a78bfa"
                        {...face}
                    />
                    <polyline points="10,80 52,60 92,60" {...hidden} />
                    <line x1="52" y1="60" x2="72" y2="24" {...hidden} />
                </>
            );
            break;
        case 'sphere':
            body = (
                <>
                    <circle cx="50" cy="50" r="38" fill="#f9a8d4" {...face} />
                    <path
                        d="M12 50a38 12 0 0 0 76 0"
                        fill="none"
                        stroke={INK}
                        strokeWidth="2"
                    />
                    <path d="M12 50a38 12 0 0 1 76 0" {...hidden} />
                    <circle cx="36" cy="34" r="8" fill="#fff" opacity="0.5" />
                </>
            );
            break;
        case 'cylinder':
            body = (
                <>
                    <path
                        d="M22 22v56a28 9 0 0 0 56 0V22"
                        fill="#5eead4"
                        {...face}
                    />
                    <ellipse
                        cx="50"
                        cy="22"
                        rx="28"
                        ry="9"
                        fill="#99f6e4"
                        {...face}
                    />
                    <path d="M22 78a28 9 0 0 1 56 0" {...hidden} />
                </>
            );
            break;
        case 'cone':
            body = (
                <>
                    <path
                        d="M50 10L20 78a30 9 0 0 0 60 0z"
                        fill="#fdba74"
                        {...face}
                    />
                    <path d="M20 78a30 9 0 0 1 60 0" {...hidden} />
                </>
            );
            break;
        default:
            body = (
                <rect
                    x="20"
                    y="20"
                    width="60"
                    height="60"
                    fill="#e2e8f0"
                    {...face}
                />
            );
    }

    return (
        <svg
            viewBox="0 0 100 100"
            className={cn('h-32 w-32', className)}
            role="img"
            aria-label={SOLID_NAMES[solid] ?? 'مجسم'}
        >
            {body}
        </svg>
    );
}

export function NetVisual({
    cells,
    className,
}: {
    cells: Cell[];
    className?: string;
}) {
    const rows = Math.max(...cells.map((c) => c[0])) + 1;
    const cols = Math.max(...cells.map((c) => c[1])) + 1;
    const size = 22;

    return (
        <svg
            viewBox={`-2 -2 ${cols * size + 4} ${rows * size + 4}`}
            className={cn('h-28 w-auto max-w-full', className)}
            role="img"
            aria-label={`شبكة من ${cells.length} مربعات`}
        >
            {cells.map(([r, c], i) => (
                <rect
                    key={i}
                    x={c * size}
                    y={r * size}
                    width={size}
                    height={size}
                    fill="#fde68a"
                    stroke={INK}
                    strokeWidth="1.8"
                />
            ))}
        </svg>
    );
}

export function LetterVisual({ letter }: { letter: string }) {
    return (
        <div
            className="flex size-28 items-center justify-center rounded-3xl border-4 border-dashed border-sea-300 bg-white"
            role="img"
            aria-label={`الحرف ${letter}`}
        >
            <span
                dir="ltr"
                className="font-sans text-7xl leading-none font-black text-berry-500"
            >
                {letter}
            </span>
        </div>
    );
}
