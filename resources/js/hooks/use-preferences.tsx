import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';
import type { ReactNode } from 'react';
import { localizeDigits } from '@/lib/digits';
import type { DigitStyle } from '@/lib/digits';
import { playSound } from '@/lib/sound';

type Preferences = {
    digits: DigitStyle;
    sound: boolean;
    setDigits: (style: DigitStyle) => void;
    setSound: (on: boolean) => void;
    /** Formats numbers inside any text using the chosen digit style. */
    n: (value: string | number) => string;
    play: (effect: Parameters<typeof playSound>[0]) => void;
};

const PreferencesContext = createContext<Preferences | null>(null);

// Display preferences only; identity and progress always come from the server.
function read<T extends string>(key: string, fallback: T, allowed: T[]): T {
    if (typeof window === 'undefined') {
        return fallback;
    }

    const value = window.localStorage.getItem(key) as T | null;

    return value && allowed.includes(value) ? value : fallback;
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
    const [digits, setDigitsState] = useState<DigitStyle>(() =>
        read<DigitStyle>('mth.digits', 'arabic', ['arabic', 'western']),
    );
    const [sound, setSoundState] = useState<boolean>(
        () => read('mth.sound', 'on', ['on', 'off']) === 'on',
    );

    const setDigits = useCallback((style: DigitStyle) => {
        setDigitsState(style);
        window.localStorage.setItem('mth.digits', style);
    }, []);

    const setSound = useCallback((on: boolean) => {
        setSoundState(on);
        window.localStorage.setItem('mth.sound', on ? 'on' : 'off');
    }, []);

    const value = useMemo<Preferences>(
        () => ({
            digits,
            sound,
            setDigits,
            setSound,
            n: (v) => localizeDigits(v, digits),
            play: (effect) => {
                if (sound) {
                    playSound(effect);
                }
            },
        }),
        [digits, sound, setDigits, setSound],
    );

    return (
        <PreferencesContext.Provider value={value}>
            {children}
        </PreferencesContext.Provider>
    );
}

export function usePreferences(): Preferences {
    const context = useContext(PreferencesContext);

    if (!context) {
        throw new Error(
            'usePreferences must be used inside PreferencesProvider',
        );
    }

    return context;
}
