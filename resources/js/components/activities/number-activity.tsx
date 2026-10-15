import { useState } from 'react';
import { VisualAid } from '@/components/visuals/visual-aid';
import type { ActivityProps, NumberQuestion } from '@/types';
import { NumberInput } from './number-input';

export function NumberActivity({
    question,
    disabled,
    onChange,
}: ActivityProps<NumberQuestion>) {
    const [value, setValue] = useState('');

    return (
        <div className="flex flex-col items-center gap-5">
            <VisualAid visual={question.data.visual} />
            <label className="flex items-center gap-3 text-2xl font-bold text-slate-700">
                <span>الإجابة:</span>
                <NumberInput
                    value={value}
                    label="اكتب الإجابة"
                    disabled={disabled}
                    autoFocus
                    className="w-36"
                    onValue={(v) => {
                        setValue(v);
                        onChange(v === '' || v === '.' ? null : { value: v });
                    }}
                />
                {question.data.unit && <span>{question.data.unit}</span>}
            </label>
        </div>
    );
}
