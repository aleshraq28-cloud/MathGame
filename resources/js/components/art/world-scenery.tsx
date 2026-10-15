/** Decorative, original SVG scenery for each world band on the map. */
export const WORLD_THEMES: Record<
    string,
    { panel: string; header: string; chip: string; path: string }
> = {
    forest: {
        panel: 'bg-gradient-to-b from-leaf-100 to-[#c7f0d2]',
        header: 'text-leaf-700',
        chip: 'bg-leaf-500',
        path: '#157a3f',
    },
    village: {
        panel: 'bg-gradient-to-b from-sand-100 to-sand-200',
        header: 'text-bark-800',
        chip: 'bg-coral-500',
        path: '#8a5a2b',
    },
    caves: {
        panel: 'bg-gradient-to-b from-[#ede4ff] to-[#d9c8fb]',
        header: 'text-berry-700',
        chip: 'bg-berry-500',
        path: '#7e22ce',
    },
    coast: {
        panel: 'bg-gradient-to-b from-sea-50 to-sea-100',
        header: 'text-sea-700',
        chip: 'bg-sea-500',
        path: '#0b6e96',
    },
    mountain: {
        panel: 'bg-gradient-to-b from-[#f1f5f9] to-[#dbe4ee]',
        header: 'text-slate-700',
        chip: 'bg-slate-600',
        path: '#475569',
    },
    treasure: {
        panel: 'bg-gradient-to-b from-sun-300/60 to-sand-200',
        header: 'text-bark-800',
        chip: 'bg-sun-500',
        path: '#b45309',
    },
};

function Tree({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
    return (
        <g transform={`translate(${x} ${y}) scale(${s})`}>
            <rect x="-3" y="10" width="6" height="14" fill="#8a5a2b" />
            <circle
                cx="0"
                cy="4"
                r="13"
                fill="#22b35e"
                stroke="#157a3f"
                strokeWidth="2"
            />
            <circle cx="-6" cy="-2" r="7" fill="#4ade80" opacity="0.7" />
        </g>
    );
}

function Palm({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
    return (
        <g transform={`translate(${x} ${y}) scale(${s})`}>
            <path
                d="M0 30C2 18 2 8 0 0"
                stroke="#8a5a2b"
                strokeWidth="5"
                fill="none"
                strokeLinecap="round"
            />
            <path
                d="M0 0c-8-6-18-4-22 2 8-2 15-1 22-2zM0 0c8-6 18-4 22 2-8-2-15-1-22-2zM0 0c-4-8-12-12-18-10 6 2 12 6 18 10zM0 0c4-8 12-12 18-10-6 2-12 6-18 10z"
                fill="#22b35e"
            />
        </g>
    );
}

function House({ x, y, color }: { x: number; y: number; color: string }) {
    return (
        <g transform={`translate(${x} ${y})`}>
            <rect
                x="-14"
                y="0"
                width="28"
                height="22"
                fill="#fff7e6"
                stroke="#8a5a2b"
                strokeWidth="2"
            />
            <path
                d="M-18 2L0-14 18 2z"
                fill={color}
                stroke="#8a5a2b"
                strokeWidth="2"
                strokeLinejoin="round"
            />
            <rect x="-4" y="9" width="8" height="13" fill="#8a5a2b" />
        </g>
    );
}

function Crystal({ x, y, color }: { x: number; y: number; color: string }) {
    return (
        <g transform={`translate(${x} ${y})`}>
            <path
                d="M0-16l7 10-7 16-7-16z"
                fill={color}
                stroke="#5b21b6"
                strokeWidth="1.5"
            />
            <path
                d="M10-6l4 6-4 10-4-10z"
                fill={color}
                opacity="0.8"
                stroke="#5b21b6"
                strokeWidth="1.2"
            />
        </g>
    );
}

function Wave({ x, y }: { x: number; y: number }) {
    return (
        <path
            d={`M${x} ${y}q8-8 16 0t16 0t16 0`}
            stroke="#0ea5d8"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
        />
    );
}

function Peak({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
    return (
        <g transform={`translate(${x} ${y}) scale(${s})`}>
            <path
                d="M-30 20L0-24 30 20z"
                fill="#94a3b8"
                stroke="#475569"
                strokeWidth="2"
                strokeLinejoin="round"
            />
            <path d="M-9-11L0-24 9-11 4-7 0-12-4-7z" fill="#fff" />
        </g>
    );
}

export function WorldScenery({ theme }: { theme: string }) {
    return (
        <svg
            className="pointer-events-none absolute inset-0 size-full"
            preserveAspectRatio="none"
            viewBox="0 0 400 300"
            aria-hidden="true"
        >
            <g opacity="0.55">
                {theme === 'forest' && (
                    <>
                        <Tree x={22} y={250} />
                        <Tree x={50} y={268} s={0.8} />
                        <Tree x={375} y={60} s={0.9} />
                        <Tree x={352} y={250} s={0.7} />
                    </>
                )}
                {theme === 'village' && (
                    <>
                        <House x={30} y={255} color="#f4623a" />
                        <House x={370} y={70} color="#0ea5d8" />
                        <Palm x={360} y={250} s={0.9} />
                    </>
                )}
                {theme === 'caves' && (
                    <>
                        <path
                            d="M0 300V250q30-50 60 0v50z"
                            fill="#a78bfa"
                            opacity="0.6"
                        />
                        <Crystal x={30} y={80} color="#c4b5fd" />
                        <Crystal x={372} y={240} color="#f0abfc" />
                    </>
                )}
                {theme === 'coast' && (
                    <>
                        <Wave x={10} y={270} />
                        <Wave x={330} y={40} />
                        <Wave x={340} y={280} />
                        <Palm x={30} y={70} s={0.8} />
                    </>
                )}
                {theme === 'mountain' && (
                    <>
                        <Peak x={40} y={260} />
                        <Peak x={360} y={70} s={0.8} />
                    </>
                )}
                {theme === 'treasure' && (
                    <>
                        <Palm x={40} y={240} />
                        <Palm x={360} y={240} s={0.9} />
                        <path
                            d="M190 40l20 20M210 40l-20 20"
                            stroke="#c2410c"
                            strokeWidth="5"
                            strokeLinecap="round"
                        />
                    </>
                )}
            </g>
        </svg>
    );
}
