import { usePreferences } from '@/hooks/use-preferences';
import { sanitizeNumberInput } from '@/lib/digits';
import { cn } from '@/lib/utils';

/**
 * Number field that accepts both Western and Arabic-Indic digits. The value
 * passed to `onValue` always uses Western digits; the server normalises too.
 */
export function NumberInput({
    value,
    onValue,
    label,
    disabled,
    className,
    autoFocus,
}: {
    value: string;
    onValue: (value: string) => void;
    label: string;
    disabled?: boolean;
    className?: string;
    autoFocus?: boolean;
}) {
    const { n } = usePreferences();

    return (
        <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            dir="ltr"
            aria-label={label}
            disabled={disabled}
            autoFocus={autoFocus}
            value={n(value)}
            onChange={(e) => onValue(sanitizeNumberInput(e.target.value))}
            className={cn(
                'h-16 w-28 rounded-2xl border-4 border-dashed border-sea-300 bg-white text-center text-3xl font-extrabold text-sea-700 outline-none placeholder:text-slate-300 focus:border-solid focus:border-sun-500 disabled:bg-slate-50',
                className,
            )}
            placeholder="؟"
        />
    );
}
