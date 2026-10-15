import { usePreferences } from '@/hooks/use-preferences';

const DIGIT = '[0-9٠-٩]';
const NUMBER = `${DIGIT}(?:[0-9٠-٩.,:]*${DIGIT})?`;
const EXPRESSION = new RegExp(
    `(${NUMBER}(?:\\s*[+\\-−×÷=<>]\\s*(?:${NUMBER}|[?؟□_]))+|${DIGIT}+:${DIGIT}{2})`,
    'g',
);

/**
 * Renders text with localized digits, keeping arithmetic such as "45 - 10 = 35"
 * in left-to-right order inside Arabic sentences.
 */
export function MathText({
    children,
    className,
}: {
    children: string;
    className?: string;
}) {
    const { n } = usePreferences();
    const text = n(children);
    const parts = text.split(EXPRESSION);

    return (
        <span className={className}>
            {parts.map((part, i) =>
                i % 2 === 1 ? (
                    <bdi
                        key={i}
                        dir="ltr"
                        className="math-ltr whitespace-nowrap"
                    >
                        {part}
                    </bdi>
                ) : (
                    part
                ),
            )}
        </span>
    );
}
