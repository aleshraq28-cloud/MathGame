const COLORS = [
    '#f5b700',
    '#f4623a',
    '#22b35e',
    '#0ea5d8',
    '#a855f7',
    '#ff8a65',
];

/** Decorative falling confetti (hidden from assistive tech, paused for reduced motion). */
export function Confetti({ pieces = 36 }: { pieces?: number }) {
    return (
        <div
            className="pointer-events-none fixed inset-0 z-40 overflow-hidden motion-reduce:hidden"
            aria-hidden="true"
        >
            {Array.from({ length: pieces }, (_, i) => {
                const left = (i * 37) % 100;
                const delay = ((i * 13) % 20) / 10;
                const duration = 2.4 + ((i * 7) % 10) / 6;

                return (
                    <span
                        key={i}
                        className="absolute -top-6 block animate-confetti rounded-sm"
                        style={{
                            left: `${left}%`,
                            width: i % 3 === 0 ? 8 : 10,
                            height: i % 3 === 0 ? 14 : 8,
                            background: COLORS[i % COLORS.length],
                            animationDelay: `${delay}s`,
                            animationDuration: `${duration}s`,
                        }}
                    />
                );
            })}
        </div>
    );
}
