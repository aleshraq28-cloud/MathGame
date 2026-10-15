import { cn } from '@/lib/utils';

export function TreasureChest({
    open = false,
    locked = false,
    className,
}: {
    open?: boolean;
    locked?: boolean;
    className?: string;
}) {
    return (
        <svg
            viewBox="0 0 160 140"
            className={cn('h-32 w-auto overflow-visible', className)}
            role="img"
            aria-label={open ? 'صندوق كنز مفتوح' : 'صندوق كنز مغلق'}
        >
            <ellipse
                cx="80"
                cy="132"
                rx="62"
                ry="7"
                fill="#000"
                opacity="0.15"
            />
            {open && (
                <g className="animate-rise">
                    <circle
                        cx="58"
                        cy="64"
                        r="11"
                        fill="#ffd23f"
                        stroke="#b45309"
                        strokeWidth="2.5"
                    />
                    <circle
                        cx="80"
                        cy="56"
                        r="12"
                        fill="#ffd23f"
                        stroke="#b45309"
                        strokeWidth="2.5"
                    />
                    <circle
                        cx="102"
                        cy="64"
                        r="11"
                        fill="#ffd23f"
                        stroke="#b45309"
                        strokeWidth="2.5"
                    />
                    <path
                        d="M80 30l6 12 13 2-9 9 2 13-12-6-12 6 2-13-9-9 13-2z"
                        fill="#fde047"
                        stroke="#b45309"
                        strokeWidth="2.5"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M66 50l6-8 6 8-6 8z"
                        fill="#60a5fa"
                        stroke="#1d4ed8"
                        strokeWidth="2"
                    />
                    <path
                        d="M92 48l5-7 5 7-5 7z"
                        fill="#f472b6"
                        stroke="#be185d"
                        strokeWidth="2"
                    />
                </g>
            )}
            {/* body */}
            <rect
                x="20"
                y="66"
                width="120"
                height="62"
                rx="8"
                fill="#a0612b"
                stroke="#5b3a1a"
                strokeWidth="4"
            />
            <path d="M20 92h120" stroke="#5b3a1a" strokeWidth="3" />
            <rect
                x="20"
                y="100"
                width="120"
                height="8"
                fill="#f5b700"
                stroke="#5b3a1a"
                strokeWidth="2"
            />
            <rect
                x="36"
                y="66"
                width="10"
                height="62"
                fill="#f5b700"
                stroke="#5b3a1a"
                strokeWidth="2"
            />
            <rect
                x="114"
                y="66"
                width="10"
                height="62"
                fill="#f5b700"
                stroke="#5b3a1a"
                strokeWidth="2"
            />
            {/* lid */}
            <g
                className={cn(open && 'animate-lid-open')}
                style={{
                    transformOrigin: '20px 70px',
                    transformBox: 'view-box',
                }}
            >
                <path
                    d="M20 70c0-30 18-42 60-42s60 12 60 42z"
                    fill="#c47a35"
                    stroke="#5b3a1a"
                    strokeWidth="4"
                    strokeLinejoin="round"
                />
                <path
                    d="M36 70c0-24 4-34 10-38M124 70c0-24-4-34-10-38"
                    stroke="#f5b700"
                    strokeWidth="8"
                    fill="none"
                />
                <path
                    d="M36 70c0-24 4-34 10-38M124 70c0-24-4-34-10-38"
                    stroke="#5b3a1a"
                    strokeWidth="2"
                    fill="none"
                />
            </g>
            {/* lock */}
            {!open && (
                <g>
                    <rect
                        x="68"
                        y="62"
                        width="24"
                        height="26"
                        rx="5"
                        fill="#ffd23f"
                        stroke="#5b3a1a"
                        strokeWidth="3"
                    />
                    {locked ? (
                        <path
                            d="M74 62v-6a6 6 0 0 1 12 0v6"
                            stroke="#5b3a1a"
                            strokeWidth="3"
                            fill="none"
                        />
                    ) : null}
                    <circle cx="80" cy="73" r="3.5" fill="#5b3a1a" />
                    <path
                        d="M80 75v7"
                        stroke="#5b3a1a"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                </g>
            )}
        </svg>
    );
}
