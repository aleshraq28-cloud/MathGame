type Effect = 'correct' | 'wrong' | 'click' | 'win' | 'star';

const NOTES: Record<Effect, [number, number][]> = {
    click: [[660, 0.05]],
    correct: [
        [523, 0.09],
        [659, 0.09],
        [784, 0.16],
    ],
    wrong: [
        [330, 0.12],
        [262, 0.18],
    ],
    star: [
        [880, 0.07],
        [1175, 0.12],
    ],
    win: [
        [523, 0.1],
        [659, 0.1],
        [784, 0.1],
        [1047, 0.25],
    ],
};

let context: AudioContext | null = null;

/** Tiny synthesized sound effects (no audio files needed). */
export function playSound(effect: Effect): void {
    if (typeof window === 'undefined' || !('AudioContext' in window)) {
        return;
    }

    try {
        context ??= new AudioContext();
        let time = context.currentTime;

        for (const [frequency, duration] of NOTES[effect]) {
            const osc = context.createOscillator();
            const gain = context.createGain();
            osc.type = effect === 'wrong' ? 'triangle' : 'sine';
            osc.frequency.value = frequency;
            gain.gain.setValueAtTime(0.0001, time);
            gain.gain.exponentialRampToValueAtTime(0.18, time + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
            osc.connect(gain).connect(context.destination);
            osc.start(time);
            osc.stop(time + duration + 0.02);
            time += duration * 0.9;
        }
    } catch {
        // Sound is optional; ignore audio errors.
    }
}
