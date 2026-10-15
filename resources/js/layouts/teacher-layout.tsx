import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    BookOpen,
    LayoutDashboard,
    LogOut,
    Users,
} from 'lucide-react';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { dashboard, logout, players } from '@/routes/teacher';
import { index as stagesIndex } from '@/routes/teacher/stages';

export default function TeacherLayout({
    title,
    current,
    children,
}: {
    title: string;
    current?: 'dashboard' | 'players' | 'stages';
    children: ReactNode;
}) {
    const { flash, teacher } = usePage().props;

    useEffect(() => {
        if (flash?.notice) {
            toast.info(flash.notice);
        }
    }, [flash?.notice]);

    return (
        <div className="min-h-dvh bg-slate-100">
            <Head title={title} />
            <header className="border-b border-slate-200 bg-white shadow-sm">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
                    <div>
                        <p className="text-sm font-bold text-sea-700">
                            لوحة المعلمة
                        </p>
                        <p className="text-lg font-extrabold text-slate-800">
                            مرحباً {teacher?.name ?? 'سالمة'}
                        </p>
                    </div>
                    <nav className="flex flex-wrap items-center gap-1">
                        <NavLink
                            href={dashboard.url()}
                            active={current === 'dashboard'}
                            icon={LayoutDashboard}
                        >
                            الرئيسية
                        </NavLink>
                        <NavLink
                            href={players.url()}
                            active={current === 'players'}
                            icon={Users}
                        >
                            اللاعبون
                        </NavLink>
                        <NavLink
                            href={stagesIndex.url()}
                            active={current === 'stages'}
                            icon={BookOpen}
                        >
                            المراحل والأسئلة
                        </NavLink>
                        <button
                            type="button"
                            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold text-coral-500 hover:bg-coral-400/10"
                            onClick={() => router.post(logout.url())}
                        >
                            <LogOut className="size-4" aria-hidden="true" />
                            خروج
                        </button>
                    </nav>
                </div>
            </header>
            <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
                {children}
            </main>
        </div>
    );
}

function NavLink({
    href,
    active,
    icon: Icon,
    children,
}: {
    href: string;
    active?: boolean;
    icon: typeof Users;
    children: ReactNode;
}) {
    return (
        <Link
            href={href}
            className={cn(
                'inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold',
                active
                    ? 'bg-sea-100 text-sea-700'
                    : 'text-slate-600 hover:bg-slate-100',
            )}
        >
            <Icon className="size-4" aria-hidden="true" />
            {children}
        </Link>
    );
}
