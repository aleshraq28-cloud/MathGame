import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { GameHeader } from '@/components/game/game-header';
import { cn } from '@/lib/utils';
import type { Summary } from '@/types';

export default function GameLayout({
    title,
    summary,
    current,
    children,
    className,
    background = 'parchment',
}: {
    title: string;
    summary?: Summary;
    current?: 'map' | 'progress' | 'achievements';
    children: ReactNode;
    className?: string;
    background?: 'parchment' | 'sea';
}) {
    const { flash } = usePage().props;

    useEffect(() => {
        if (flash?.notice) {
            toast.info(flash.notice);
        }
    }, [flash?.notice]);

    return (
        <div
            className={cn(
                'min-h-dvh overflow-x-clip',
                background === 'sea' ? 'bg-island-sea' : 'bg-parchment',
            )}
        >
            <Head title={title} />
            <a
                href="#main"
                className="sr-only focus:not-sr-only focus:absolute focus:start-2 focus:top-2 focus:z-50 focus:rounded-xl focus:bg-white focus:px-4 focus:py-2"
            >
                انتقل إلى المحتوى
            </a>
            <GameHeader summary={summary} current={current} />
            <main
                id="main"
                className={cn(
                    'mx-auto w-full max-w-6xl px-3 py-5 sm:px-5 sm:py-8',
                    className,
                )}
            >
                {children}
            </main>
        </div>
    );
}
