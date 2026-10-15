import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** "جود" — the friendly sea-turtle explorer who guides the student. */
export function TurtleGuide({
    className,
    mood = 'happy',
}: {
    className?: string;
    mood?: 'happy' | 'thinking' | 'cheer';
}) {
    return (
        <svg
            viewBox="0 0 120 110"
            className={cn('h-24 w-auto', className)}
            role="img"
            aria-label="السلحفاة جود، مرشدتك في الرحلة"
        >
            <ellipse
                cx="60"
                cy="102"
                rx="40"
                ry="6"
                fill="#000"
                opacity="0.12"
            />
            {/* flippers */}
            <ellipse
                cx="24"
                cy="80"
                rx="14"
                ry="8"
                fill="#4ade80"
                stroke="#157a3f"
                strokeWidth="2.5"
                transform="rotate(-25 24 80)"
            />
            <ellipse
                cx="96"
                cy="80"
                rx="14"
                ry="8"
                fill="#4ade80"
                stroke="#157a3f"
                strokeWidth="2.5"
                transform="rotate(25 96 80)"
            />
            {mood === 'cheer' ? (
                <>
                    <ellipse
                        cx="22"
                        cy="46"
                        rx="13"
                        ry="7"
                        fill="#4ade80"
                        stroke="#157a3f"
                        strokeWidth="2.5"
                        transform="rotate(-50 22 46)"
                    />
                    <ellipse
                        cx="98"
                        cy="46"
                        rx="13"
                        ry="7"
                        fill="#4ade80"
                        stroke="#157a3f"
                        strokeWidth="2.5"
                        transform="rotate(50 98 46)"
                    />
                </>
            ) : (
                <>
                    <ellipse
                        cx="22"
                        cy="62"
                        rx="13"
                        ry="7"
                        fill="#4ade80"
                        stroke="#157a3f"
                        strokeWidth="2.5"
                        transform="rotate(-10 22 62)"
                    />
                    <ellipse
                        cx="98"
                        cy="62"
                        rx="13"
                        ry="7"
                        fill="#4ade80"
                        stroke="#157a3f"
                        strokeWidth="2.5"
                        transform="rotate(10 98 62)"
                    />
                </>
            )}
            {/* shell */}
            <path
                d="M28 82c0-26 14-40 32-40s32 14 32 40z"
                fill="#a16207"
                stroke="#5b3a1a"
                strokeWidth="3"
            />
            <path
                d="M44 82c0-14 6-24 16-24s16 10 16 24M60 58v24M36 70h48"
                stroke="#ca8a04"
                strokeWidth="3"
                fill="none"
            />
            <path
                d="M26 82h68"
                stroke="#5b3a1a"
                strokeWidth="3"
                strokeLinecap="round"
            />
            {/* head */}
            <circle
                cx="60"
                cy="32"
                r="20"
                fill="#4ade80"
                stroke="#157a3f"
                strokeWidth="3"
            />
            <circle cx="52" cy="31" r="4" fill="#1f2a37" />
            <circle cx="68" cy="31" r="4" fill="#1f2a37" />
            <circle cx="53.5" cy="29.5" r="1.4" fill="#fff" />
            <circle cx="69.5" cy="29.5" r="1.4" fill="#fff" />
            <circle cx="46" cy="38" r="3.5" fill="#f9a8d4" opacity="0.8" />
            <circle cx="74" cy="38" r="3.5" fill="#f9a8d4" opacity="0.8" />
            {mood === 'thinking' ? (
                <path
                    d="M54 41h12"
                    stroke="#157a3f"
                    strokeWidth="3"
                    strokeLinecap="round"
                />
            ) : (
                <path
                    d="M52 39q8 8 16 0"
                    stroke="#157a3f"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                />
            )}
            {/* explorer hat */}
            <path
                d="M36 18c4-2 44-2 48 0-2 3-46 3-48 0z"
                fill="#d97706"
                stroke="#5b3a1a"
                strokeWidth="2.5"
            />
            <path
                d="M44 17c0-12 32-12 32 0z"
                fill="#f59e0b"
                stroke="#5b3a1a"
                strokeWidth="2.5"
            />
            <path d="M45 14h30" stroke="#b91c1c" strokeWidth="3" />
        </svg>
    );
}

export function GuideBubble({
    children,
    mood,
    className,
}: {
    children: ReactNode;
    mood?: 'happy' | 'thinking' | 'cheer';
    className?: string;
}) {
    return (
        <div className={cn('flex items-end gap-2', className)}>
            <TurtleGuide
                mood={mood}
                className="h-20 shrink-0 animate-bob sm:h-24"
            />
            <div className="relative mb-6 rounded-3xl border-2 border-leaf-300 bg-white px-4 py-3 text-base font-semibold text-leaf-700 shadow-sm sm:text-lg">
                <span
                    className="absolute -start-2 bottom-3 size-4 rotate-45 border-s-2 border-b-2 border-leaf-300 bg-white"
                    aria-hidden="true"
                />
                {children}
            </div>
        </div>
    );
}
