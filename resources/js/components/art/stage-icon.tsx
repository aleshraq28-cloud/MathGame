import {
    Apple,
    Blocks,
    Box,
    Clock,
    Coins,
    Compass,
    Flower2,
    FlipHorizontal2,
    Gem,
    Hourglass,
    Landmark,
    Layers,
    Mountain,
    Ruler,
    Scale,
    Shapes,
    Store,
    Target,
    Waypoints,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
    blocks: Blocks,
    bridge: Waypoints,
    cards: Layers,
    store: Store,
    scale: Scale,
    flower: Flower2,
    gate: Landmark,
    shapes: Shapes,
    box: Box,
    mirror: FlipHorizontal2,
    compass: Compass,
    coins: Coins,
    clock: Clock,
    hourglass: Hourglass,
    apple: Apple,
    ruler: Ruler,
    target: Target,
    mountain: Mountain,
    treasure: Gem,
};

export function StageIcon({
    name,
    className,
}: {
    name: string;
    className?: string;
}) {
    const Icon = ICONS[name] ?? Shapes;

    return <Icon className={className} aria-hidden="true" />;
}
