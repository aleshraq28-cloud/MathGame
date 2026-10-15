import { cn } from '@/lib/utils';

const STROKE = '#5b3a1a';

const ICONS: Record<string, React.ReactNode> = {
    apple: (
        <>
            <path
                d="M20 12c-4-4-13-3-13 8 0 9 6 15 10 15 2 0 2-1 3-1s1 1 3 1c4 0 10-6 10-15 0-11-9-12-13-8z"
                fill="#ef4444"
                stroke={STROKE}
                strokeWidth="1.5"
            />
            <path
                d="M20 12c0-3 1-6 3-7"
                stroke={STROKE}
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
            />
            <path d="M22 8c3-3 7-2 8 0-3 2-6 2-8 0z" fill="#22b35e" />
            <ellipse cx="13" cy="19" rx="2" ry="3" fill="#fff" opacity="0.5" />
        </>
    ),
    orange: (
        <>
            <circle
                cx="20"
                cy="22"
                r="13"
                fill="#fb923c"
                stroke={STROKE}
                strokeWidth="1.5"
            />
            <path d="M20 9c1-3 4-4 6-3-1 3-4 4-6 3z" fill="#22b35e" />
            <circle cx="15" cy="18" r="1" fill="#fed7aa" />
            <circle cx="24" cy="25" r="1" fill="#fed7aa" />
            <circle cx="18" cy="28" r="1" fill="#fed7aa" />
        </>
    ),
    banana: (
        <>
            <path
                d="M8 12c2 14 12 22 26 18-2-2-4-2-6-2-10 0-15-8-16-17z"
                fill="#fde047"
                stroke={STROKE}
                strokeWidth="1.5"
                strokeLinejoin="round"
            />
            <path d="M8 12l-1-3 3 1z" fill={STROKE} />
        </>
    ),
    pear: (
        <>
            <path
                d="M20 8c-3 0-4 4-4 7 0 3-6 6-6 12 0 5 4 8 10 8s10-3 10-8c0-6-6-9-6-12 0-3-1-7-4-7z"
                fill="#a3e635"
                stroke={STROKE}
                strokeWidth="1.5"
            />
            <path
                d="M20 8c0-2 1-4 2-5"
                stroke={STROKE}
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
            />
        </>
    ),
    date: (
        <>
            <ellipse
                cx="20"
                cy="21"
                rx="8"
                ry="13"
                fill="#92400e"
                stroke={STROKE}
                strokeWidth="1.5"
            />
            <ellipse
                cx="17"
                cy="16"
                rx="2"
                ry="5"
                fill="#b45309"
                opacity="0.8"
            />
            <path
                d="M18 8h4"
                stroke="#fbbf24"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </>
    ),
    star: (
        <path
            d="M20 4l4.7 9.6 10.5 1.5-7.6 7.4 1.8 10.5L20 28l-9.4 5 1.8-10.5-7.6-7.4 10.5-1.5z"
            fill="#ffd23f"
            stroke={STROKE}
            strokeWidth="1.5"
            strokeLinejoin="round"
        />
    ),
    flower: (
        <>
            <path d="M20 22v14" stroke="#157a3f" strokeWidth="2.5" />
            <path d="M20 31c-4 0-6-3-6-5 3 0 6 2 6 5z" fill="#22b35e" />
            {[0, 72, 144, 216, 288].map((a) => (
                <ellipse
                    key={a}
                    cx="20"
                    cy="9"
                    rx="5"
                    ry="7"
                    fill="#f472b6"
                    stroke={STROKE}
                    strokeWidth="1.2"
                    transform={`rotate(${a} 20 16)`}
                />
            ))}
            <circle
                cx="20"
                cy="16"
                r="4.5"
                fill="#ffd23f"
                stroke={STROKE}
                strokeWidth="1.2"
            />
        </>
    ),
    egg: (
        <path
            d="M20 5c-7 0-11 11-11 18 0 7 5 12 11 12s11-5 11-12C31 16 27 5 20 5z"
            fill="#fef3c7"
            stroke={STROKE}
            strokeWidth="1.5"
        />
    ),
    cupcake: (
        <>
            <path
                d="M10 20h20l-3 15H13z"
                fill="#60a5fa"
                stroke={STROKE}
                strokeWidth="1.5"
                strokeLinejoin="round"
            />
            <path
                d="M8 21c0-8 5-13 12-13s12 5 12 13z"
                fill="#f9a8d4"
                stroke={STROKE}
                strokeWidth="1.5"
            />
            <circle
                cx="20"
                cy="7"
                r="3"
                fill="#ef4444"
                stroke={STROKE}
                strokeWidth="1.2"
            />
        </>
    ),
    pencil: (
        <>
            <path
                d="M6 30L28 8l5 5-22 22H6z"
                fill="#facc15"
                stroke={STROKE}
                strokeWidth="1.5"
                strokeLinejoin="round"
            />
            <path
                d="M6 30v5h5z"
                fill="#fde68a"
                stroke={STROKE}
                strokeWidth="1.2"
            />
            <path
                d="M28 8l3-3 5 5-3 3z"
                fill="#f472b6"
                stroke={STROKE}
                strokeWidth="1.2"
            />
        </>
    ),
    book: (
        <>
            <path
                d="M6 9h13v24H6z"
                fill="#38bdf8"
                stroke={STROKE}
                strokeWidth="1.5"
            />
            <path
                d="M21 9h13v24H21z"
                fill="#0ea5d8"
                stroke={STROKE}
                strokeWidth="1.5"
            />
            <path
                d="M9 14h7M9 18h7M24 14h7M24 18h7"
                stroke="#fff"
                strokeWidth="1.5"
            />
        </>
    ),
    ball: (
        <>
            <circle
                cx="20"
                cy="20"
                r="14"
                fill="#fff"
                stroke={STROKE}
                strokeWidth="1.5"
            />
            <path d="M20 13l5 4-2 6h-6l-2-6z" fill="#1f2a37" />
            <path
                d="M20 13V6M25 17l7-2M23 23l4 6M17 23l-4 6M15 17l-7-2"
                stroke="#1f2a37"
                strokeWidth="1.2"
            />
        </>
    ),
    doll: (
        <>
            <circle
                cx="20"
                cy="11"
                r="6"
                fill="#fcd7b6"
                stroke={STROKE}
                strokeWidth="1.5"
            />
            <path d="M14 10c0-6 12-6 12 0-2-2-10-2-12 0z" fill="#7c2d12" />
            <path
                d="M12 35l4-17h8l4 17z"
                fill="#c084fc"
                stroke={STROKE}
                strokeWidth="1.5"
                strokeLinejoin="round"
            />
            <circle cx="18" cy="11" r="0.9" fill={STROKE} />
            <circle cx="22" cy="11" r="0.9" fill={STROKE} />
        </>
    ),
    car: (
        <>
            <path
                d="M5 26v-5l5-7h16l6 7h3v5z"
                fill="#ef4444"
                stroke={STROKE}
                strokeWidth="1.5"
                strokeLinejoin="round"
            />
            <path d="M12 16h5v5h-8zM20 16h5l4 5h-9z" fill="#cff4fe" />
            <circle cx="12" cy="27" r="4" fill="#1f2a37" />
            <circle cx="28" cy="27" r="4" fill="#1f2a37" />
        </>
    ),
    tree: (
        <>
            <path d="M18 26h4v10h-4z" fill="#8a5a2b" />
            <circle
                cx="20"
                cy="17"
                r="11"
                fill="#22b35e"
                stroke="#157a3f"
                strokeWidth="1.5"
            />
            <circle cx="15" cy="15" r="1.6" fill="#ef4444" />
            <circle cx="24" cy="20" r="1.6" fill="#ef4444" />
            <circle cx="22" cy="11" r="1.6" fill="#ef4444" />
        </>
    ),
    hand: (
        <path
            d="M13 35c-3-3-6-9-7-12-1-2 2-3 3-1l3 5V9c0-2 3-2 3 0v10V6c0-2 3-2 3 0v13V7c0-2 3-2 3 0v12V10c0-2 3-2 3 0v15c0 4-2 8-4 10z"
            fill="#fcd7b6"
            stroke={STROKE}
            strokeWidth="1.5"
            strokeLinejoin="round"
        />
    ),
    fish: (
        <>
            <path
                d="M6 20c6-9 18-9 24 0-6 9-18 9-24 0z"
                fill="#38bdf8"
                stroke={STROKE}
                strokeWidth="1.5"
            />
            <path
                d="M30 20l6-6v12z"
                fill="#0ea5d8"
                stroke={STROKE}
                strokeWidth="1.5"
                strokeLinejoin="round"
            />
            <circle cx="12" cy="18" r="1.5" fill={STROKE} />
        </>
    ),
};

export function ObjectIcon({
    name,
    className,
}: {
    name: string;
    className?: string;
}) {
    return (
        <svg
            viewBox="0 0 40 40"
            className={cn('size-8', className)}
            aria-hidden="true"
        >
            {ICONS[name] ?? ICONS.star}
        </svg>
    );
}

export const OBJECT_NAMES: Record<string, string> = {
    apple: 'تفاحة',
    orange: 'برتقالة',
    banana: 'موزة',
    pear: 'كمثرى',
    date: 'تمرة',
    star: 'نجمة',
    flower: 'زهرة',
    egg: 'بيضة',
    cupcake: 'كعكة',
    pencil: 'قلم',
    book: 'كتاب',
    ball: 'كرة',
    doll: 'دمية',
    car: 'سيارة',
    tree: 'شجرة',
    hand: 'يد',
    fish: 'سمكة',
};
