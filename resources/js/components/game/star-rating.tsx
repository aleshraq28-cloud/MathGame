import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StarRating({
    value,
    max = 3,
    size = 'md',
    animate = false,
    className,
}: {
    value: number;
    max?: number;
    size?: 'sm' | 'md' | 'lg';
    animate?: boolean;
    className?: string;
}) {
    const sizes = { sm: 'size-4', md: 'size-6', lg: 'size-12 sm:size-14' };

    return (
        <span
            className={cn('inline-flex items-center gap-0.5', className)}
            role="img"
            aria-label={`${value} من ${max} نجوم`}
        >
            {Array.from({ length: max }, (_, i) => (
                <Star
                    key={i}
                    className={cn(
                        sizes[size],
                        i < value
                            ? 'fill-sun-400 text-sun-500'
                            : 'fill-white/70 text-slate-300',
                        animate && i < value && 'animate-star-pop',
                    )}
                    style={
                        animate
                            ? { animationDelay: `${0.3 + i * 0.25}s` }
                            : undefined
                    }
                    strokeWidth={2}
                    aria-hidden="true"
                />
            ))}
        </span>
    );
}
