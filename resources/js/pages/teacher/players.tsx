import { Link } from '@inertiajs/react';
import { Star } from 'lucide-react';
import TeacherLayout from '@/layouts/teacher-layout';
import { show as showPlayer } from '@/routes/teacher/players';

type Player = {
    id: number;
    name: string;
    last_played_at: string | null;
    completed_stages: number;
    total_stages: number;
    percent: number;
    stars: number;
    max_stars: number;
    best_score_total: number;
    practice_points: number;
    treasure_found: boolean;
    current_stage: {
        slug: string;
        title: string;
        stage_number: number;
        world_number: number;
    } | null;
    attempts_count: number;
};

type Props = {
    players: Player[];
    overview: {
        players: number;
        completed_stages: number;
        stars: number;
        treasure_found: number;
    };
};

function formatDate(value: string | null): string {
    if (!value) {
        return 'لم يلعب بعد';
    }

    return new Intl.DateTimeFormat('ar', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

export default function TeacherPlayers({ players }: Props) {
    return (
        <TeacherLayout title="اللاعبون" current="players">
            <h1 className="text-3xl font-extrabold text-slate-800">
                قائمة اللاعبين
            </h1>
            <p className="mt-1 text-slate-600">
                {players.length === 0
                    ? 'لا يوجد لاعبون بعد. عندما يبدأ الطلاب اللعب سيظهرون هنا.'
                    : `${players.length} لاعب — اضغطي على اسم لعرض التفاصيل.`}
            </p>

            {players.length > 0 && (
                <div className="mt-6 overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <table className="min-w-full text-start text-sm">
                        <thead className="bg-slate-50 text-slate-600">
                            <tr>
                                <th className="px-4 py-3 font-bold">الاسم</th>
                                <th className="px-4 py-3 font-bold">
                                    المرحلة الحالية
                                </th>
                                <th className="px-4 py-3 font-bold">التقدّم</th>
                                <th className="px-4 py-3 font-bold">النجوم</th>
                                <th className="px-4 py-3 font-bold">النقاط</th>
                                <th className="px-4 py-3 font-bold">
                                    آخر لعب
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {players.map((player) => (
                                <tr
                                    key={player.id}
                                    className="border-t border-slate-100 hover:bg-sea-50/50"
                                >
                                    <td className="px-4 py-3">
                                        <Link
                                            href={showPlayer.url(player.id)}
                                            className="font-extrabold text-sea-700 hover:underline"
                                        >
                                            {player.name}
                                        </Link>
                                        {player.treasure_found && (
                                            <span className="ms-2 rounded-full bg-sun-300 px-2 py-0.5 text-xs font-bold text-bark-800">
                                                كنز
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-slate-700">
                                        {player.current_stage
                                            ? `${player.current_stage.stage_number}. ${player.current_stage.title}`
                                            : 'اكتمل الكل'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-200">
                                                <div
                                                    className="h-full rounded-full bg-leaf-500"
                                                    style={{
                                                        width: `${player.percent}%`,
                                                    }}
                                                />
                                            </div>
                                            <span className="font-bold text-slate-700">
                                                {player.completed_stages}/
                                                {player.total_stages}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center gap-1 font-bold text-sun-500">
                                            <Star
                                                className="size-4 fill-current"
                                                aria-hidden="true"
                                            />
                                            {player.stars}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 font-bold text-slate-700">
                                        {player.practice_points}
                                    </td>
                                    <td className="px-4 py-3 text-slate-500">
                                        {formatDate(player.last_played_at)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </TeacherLayout>
    );
}
