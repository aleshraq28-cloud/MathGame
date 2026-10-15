const ARABIC_INDIC = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

export type DigitStyle = 'arabic' | 'western';

/** Shows Western digits in a string using the chosen digit style. */
export function localizeDigits(
    value: string | number,
    style: DigitStyle,
): string {
    const text = String(value);

    if (style === 'western') {
        return text;
    }

    return text.replace(/[0-9]/g, (d) => ARABIC_INDIC[Number(d)]);
}

/** Converts Arabic-Indic / Persian digits typed by a student into Western digits. */
export function toWesternDigits(value: string): string {
    return value
        .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
        .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
        .replace(/٫/g, '.');
}

/** Keeps only characters that can form a number. */
export function sanitizeNumberInput(value: string): string {
    return toWesternDigits(value)
        .replace(/[^0-9.]/g, '')
        .slice(0, 7);
}
