import { cn } from '@/lib/utils';
import type { Visual } from '@/types';
import {
    AxisShapeVisual,
    LetterVisual,
    NetVisual,
    ShapesVisual,
    ShapeVisual,
    SolidVisual,
} from './geometry';
import {
    BarsVisual,
    ClockFace,
    CoinsVisual,
    DigitalClock,
    GridBoard,
    JarVisual,
    PricesVisual,
    RulerVisual,
    ScaleVisual,
} from './measures';
import {
    AbacusVisual,
    ArrayVisual,
    BlocksVisual,
    CardsVisual,
    GroupsVisual,
    NumberLineVisual,
    ObjectsVisual,
} from './numbers';

function render(visual: Visual, compact: boolean) {
    switch (visual.kind) {
        case 'blocks':
            return <BlocksVisual {...visual} />;
        case 'abacus':
            return <AbacusVisual {...visual} />;
        case 'cards':
            return <CardsVisual digits={visual.digits} />;
        case 'array':
            return <ArrayVisual {...visual} />;
        case 'groups':
            return <GroupsVisual {...visual} />;
        case 'objects':
            return <ObjectsVisual items={visual.items} />;
        case 'number_line':
            return <NumberLineVisual {...visual} />;
        case 'clock':
            return (
                <ClockFace
                    hour={visual.hour}
                    minute={visual.minute}
                    className={compact ? 'size-28' : undefined}
                />
            );
        case 'digital_clock':
            return <DigitalClock hour={visual.hour} minute={visual.minute} />;
        case 'shape':
            return (
                <ShapeVisual
                    shape={visual.shape}
                    className={compact ? 'size-20' : undefined}
                />
            );
        case 'shapes':
            return <ShapesVisual shapes={visual.shapes} />;
        case 'axis_shape':
            return <AxisShapeVisual shape={visual.shape} line={visual.line} />;
        case 'solid':
            return (
                <SolidVisual
                    solid={visual.solid}
                    className={compact ? 'size-24' : undefined}
                />
            );
        case 'net':
            return (
                <NetVisual
                    cells={visual.cells}
                    className={compact ? 'h-24' : undefined}
                />
            );
        case 'letter':
            return <LetterVisual letter={visual.letter} />;
        case 'coins':
            return <CoinsVisual coins={visual.coins} unit={visual.unit} />;
        case 'prices':
            return <PricesVisual items={visual.items} unit={visual.unit} />;
        case 'bars':
            return <BarsVisual {...visual} />;
        case 'ruler':
            return (
                <RulerVisual length={visual.length} object={visual.object} />
            );
        case 'scale':
            return <ScaleVisual {...visual} />;
        case 'jar':
            return <JarVisual fill={visual.fill} capacity={visual.capacity} />;
        case 'grid':
            return (
                <GridBoard
                    rows={visual.rows}
                    cols={visual.cols}
                    start={visual.start}
                    target={visual.target}
                    obstacles={visual.obstacles}
                    size="sm"
                />
            );
        default:
            return null;
    }
}

export function VisualAid({
    visual,
    compact = false,
    className,
}: {
    visual?: Visual | null;
    compact?: boolean;
    className?: string;
}) {
    if (!visual) {
        return null;
    }

    return (
        <div className={cn('flex w-full justify-center', className)}>
            {render(visual, compact)}
        </div>
    );
}
