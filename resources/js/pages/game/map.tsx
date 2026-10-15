import { Link } from '@inertiajs/react';
import { Play } from 'lucide-react';
import { GuideBubble } from '@/components/art/turtle-guide';
import { TreasureMap } from '@/components/game/treasure-map';
import { usePreferences } from '@/hooks/use-preferences';
import GameLayout from '@/layouts/game-layout';
import { show } from '@/routes/game/stages';
import type { MapStage, Summary, Worlds } from '@/types';

export default function GameMap({
    stages,
    worlds,
    summary,
}: {
    stages: MapStage[];
    worlds: Worlds;
    summary: Summary;
}) {
    const { n } = usePreferences();
    const next = summary.next_stage;

    const message = summary.treasure_found
        ? 'لقد وجدت الكنز! يمكنك إعادة أي مرحلة لتحسين نجومك.'
        : summary.completed_stages === 0
          ? 'هيا نبدأ! اضغط على المرحلة الأولى في غابة الأعداد.'
          : `رائع! أكملت ${n(summary.completed_stages)} من ${n(summary.total_stages)} مراحل. تابع الطريق نحو الكنز!`;

    return (
        <GameLayout
            title="خريطة الكنز"
            summary={summary}
            current="map"
            background="sea"
        >
            <div className="mb-5 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
                <GuideBubble mood={summary.treasure_found ? 'cheer' : 'happy'}>
                    {message}
                </GuideBubble>
                {next && (
                    <Link
                        href={show.url(next.slug)}
                        className="game-btn mb-2 bg-sun-400 text-bark-800 hover:bg-sun-300"
                    >
                        <Play
                            className="size-5 fill-current"
                            aria-hidden="true"
                        />
                        المرحلة التالية: {next.title}
                    </Link>
                )}
            </div>

            <h1 className="sr-only">خريطة رحلة البحث عن الكنز</h1>
            <TreasureMap stages={stages} worlds={worlds} />
        </GameLayout>
    );
}
