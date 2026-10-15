import { router } from '@inertiajs/react';
import { LogOut, UserRoundCog } from 'lucide-react';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { switchMethod } from '@/routes/students';

export function ConfirmStudentSwitchDialog({
    studentName,
    compact = false,
}: {
    studentName: string;
    compact?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);

    const confirm = () => {
        setBusy(true);
        router.post(switchMethod.url(), {}, { onFinish: () => setBusy(false) });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        'game-btn min-h-11 bg-white px-3 text-base text-coral-500 ring-2 ring-coral-400/60',
                        compact && 'px-2.5',
                    )}
                >
                    <UserRoundCog className="size-5" aria-hidden="true" />
                    <span className={cn(compact && 'sr-only sm:not-sr-only')}>
                        تغيير الطالب
                    </span>
                </button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl border-4 border-sand-200 bg-sand-50 text-center sm:max-w-md">
                <UserRoundCog
                    className="mx-auto size-14 text-coral-500"
                    aria-hidden="true"
                />
                <DialogTitle className="text-2xl font-extrabold text-bark-800">
                    هل تريد تغيير الطالب؟
                </DialogTitle>
                <DialogDescription className="text-lg text-slate-600">
                    ستُحفَظ نجوم{' '}
                    <strong className="text-bark-800">{studentName}</strong>{' '}
                    وتقدّمه. يمكنه العودة لاحقاً بكتابة نفس الاسم. بعد ذلك يمكن
                    لطالب آخر أن يكتب اسمه.
                </DialogDescription>
                <DialogFooter className="mt-2 gap-3 sm:justify-center">
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="game-btn bg-leaf-500 text-white"
                    >
                        لا، أكمل اللعب
                    </button>
                    <button
                        type="button"
                        onClick={confirm}
                        disabled={busy}
                        className="game-btn bg-coral-500 text-white"
                    >
                        <LogOut className="size-5" aria-hidden="true" />
                        نعم، غيّر الطالب
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
