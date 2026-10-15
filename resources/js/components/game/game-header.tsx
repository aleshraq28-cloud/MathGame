import { Link, usePage } from '@inertiajs/react';
import {
    Award,
    BarChart3,
    Map as MapIcon,
    Star,
    Volume2,
    VolumeX,
} from 'lucide-react';
import { TreasureChest } from '@/components/art/treasure-chest';
import { ConfirmStudentSwitchDialog } from '@/components/game/confirm-student-switch-dialog';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { usePreferences } from '@/hooks/use-preferences';
import { cn } from '@/lib/utils';
import { achievements, map, progress } from '@/routes/game';
import type { Summary } from '@/types';

function IconButton({
    label,
    onClick,
    href,
    active,
    children,
}: {
    label: string;
    onClick?: () => void;
    href?: string;
    active?: boolean;
    children: React.ReactNode;
}) {
    const className = cn(
        'inline-flex size-11 items-center justify-center rounded-2xl bg-white text-sea-700 shadow-[0_4px_0_rgb(0_0_0_/_0.12)] ring-2 ring-sea-100 transition active:translate-y-0.5',
        active && 'bg-sea-500 text-white ring-sea-300',
    );

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                {href ? (
                    <Link
                        href={href}
                        className={className}
                        aria-label={label}
                        aria-current={active ? 'page' : undefined}
                    >
                        {children}
                    </Link>
                ) : (
                    <button
                        type="button"
                        onClick={onClick}
                        className={className}
                        aria-label={label}
                    >
                        {children}
                    </button>
                )}
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
        </Tooltip>
    );
}

export function GameHeader({
    summary,
    current,
}: {
    summary?: Summary;
    current?: 'map' | 'progress' | 'achievements';
}) {
    const { student } = usePage().props;
    const { n, sound, setSound, digits, setDigits } = usePreferences();

    if (!student) {
        return null;
    }

    return (
        <header className="relative top-0 z-30 border-b-4 border-sand-200 bg-sand-50/95 backdrop-blur supports-[backdrop-filter]:bg-sand-50/85 sm:sticky">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2 sm:px-5">
                <Link
                    href={map.url()}
                    className="flex items-center gap-2 rounded-2xl"
                    aria-label="العودة إلى الخريطة"
                >
                    <TreasureChest className="h-10 sm:h-12" />
                    <div className="leading-tight">
                        <p className="text-sm font-semibold text-bark-600 sm:text-base">
                            رحلة البحث عن الكنز
                        </p>
                        <p className="text-lg font-extrabold text-bark-800 sm:text-xl">
                            مرحباً يا{' '}
                            <span className="text-coral-500">
                                {student.name}
                            </span>
                            !
                        </p>
                    </div>
                </Link>

                {summary && (
                    <div className="order-3 flex w-full items-center gap-2 sm:order-none sm:w-auto sm:flex-1 sm:justify-center">
                        <span
                            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 font-bold text-bark-800 ring-2 ring-sun-300"
                            title="النجوم"
                        >
                            <Star
                                className="size-5 fill-sun-400 text-sun-500"
                                aria-hidden="true"
                            />
                            <span className="sr-only">النجوم:</span>
                            {n(summary.stars)}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 font-bold text-leaf-700 ring-2 ring-leaf-300">
                            <MapIcon className="size-5" aria-hidden="true" />
                            {n(
                                `${summary.completed_stages}/${summary.total_stages}`,
                            )}
                            <span className="sr-only">مراحل مكتملة</span>
                        </span>
                        <div className="flex min-w-24 flex-1 items-center gap-2 sm:max-w-48">
                            <div
                                className="h-3.5 flex-1 overflow-hidden rounded-full bg-white ring-2 ring-sea-100"
                                role="progressbar"
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-valuenow={summary.percent}
                                aria-label="التقدّم في الرحلة"
                            >
                                <div
                                    className="h-full rounded-full bg-gradient-to-l from-leaf-500 to-sea-500 transition-all"
                                    style={{ width: `${summary.percent}%` }}
                                />
                            </div>
                            <span className="text-sm font-bold text-sea-700">
                                {n(summary.percent)}٪
                            </span>
                        </div>
                    </div>
                )}

                <nav
                    className="ms-auto flex items-center gap-2"
                    aria-label="أدوات اللعبة"
                >
                    <IconButton
                        label="الخريطة"
                        href={map.url()}
                        active={current === 'map'}
                    >
                        <MapIcon className="size-5" />
                    </IconButton>
                    <IconButton
                        label="تقدّمي"
                        href={progress.url()}
                        active={current === 'progress'}
                    >
                        <BarChart3 className="size-5" />
                    </IconButton>
                    <IconButton
                        label="الأوسمة"
                        href={achievements.url()}
                        active={current === 'achievements'}
                    >
                        <Award className="size-5" />
                    </IconButton>
                    <IconButton
                        label={sound ? 'إيقاف الصوت' : 'تشغيل الصوت'}
                        onClick={() => setSound(!sound)}
                    >
                        {sound ? (
                            <Volume2 className="size-5" />
                        ) : (
                            <VolumeX className="size-5" />
                        )}
                    </IconButton>
                    <IconButton
                        label={
                            digits === 'arabic'
                                ? 'استخدم الأرقام 123'
                                : 'استخدم الأرقام ١٢٣'
                        }
                        onClick={() =>
                            setDigits(
                                digits === 'arabic' ? 'western' : 'arabic',
                            )
                        }
                    >
                        <span className="text-base font-extrabold">
                            {digits === 'arabic' ? '١٢٣' : '123'}
                        </span>
                    </IconButton>
                    <ConfirmStudentSwitchDialog
                        studentName={student.name}
                        compact
                    />
                </nav>
            </div>
        </header>
    );
}
