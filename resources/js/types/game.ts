export type Cell = [number, number];

export type StageStatus = 'locked' | 'unlocked' | 'current' | 'completed';

export type StageCard = {
    id: number;
    slug: string;
    title: string;
    description: string;
    world_number: number;
    stage_number: number;
    topic: string;
    icon: string;
    difficulty: number;
    is_final: boolean;
};

export type MapStage = StageCard & {
    status: StageStatus;
    stars: number;
    best_score: number;
    attempts: number;
};

export type World = { name: string; tagline: string; theme: string };

export type Worlds = Record<number, World>;

export type Summary = {
    completed_stages: number;
    total_stages: number;
    percent: number;
    stars: number;
    max_stars: number;
    best_score_total: number;
    practice_points: number;
    next_stage: { slug: string; title: string; stage_number: number } | null;
    treasure_found: boolean;
};

export type Rules = {
    first_try: number;
    after_hint: number;
    second_try: number;
    third_try: number;
    max_tries: number;
    completion_bonus: number;
    pass_percent: number;
};

export type Achievement = {
    key: string;
    title: string;
    description: string;
    icon: string;
    earned?: boolean;
    earned_at?: string | null;
};

/* ---------- Visual aids ---------- */

export type Visual =
    | { kind: 'blocks'; hundreds: number; tens: number; ones: number }
    | { kind: 'abacus'; hundreds: number; tens: number; ones: number }
    | { kind: 'cards'; digits: number[] }
    | { kind: 'array'; rows: number; cols: number; icon: string }
    | {
          kind: 'groups';
          groups: number;
          per_group: number;
          icon: string;
          container: string;
      }
    | { kind: 'objects'; items: { icon: string; count: number }[] }
    | {
          kind: 'number_line';
          start: number;
          end: number;
          step: number;
          pointer: number | null;
          label_all: boolean;
      }
    | { kind: 'clock'; hour: number; minute: number }
    | { kind: 'digital_clock'; hour: number; minute: number }
    | { kind: 'shape'; shape: string }
    | { kind: 'shapes'; shapes: string[] }
    | { kind: 'axis_shape'; shape: string; line: string }
    | { kind: 'solid'; solid: string }
    | { kind: 'net'; cells: Cell[] }
    | { kind: 'letter'; letter: string }
    | { kind: 'coins'; coins: number[]; unit: string }
    | {
          kind: 'prices';
          items: { icon: string; label: string; price: number }[];
          unit: string;
      }
    | {
          kind: 'bars';
          bars: { label: string; value: number; color?: string }[];
          unit: string;
          style: 'rope' | 'chart';
      }
    | { kind: 'ruler'; length: number; object: string }
    | { kind: 'scale'; value: number; max: number; unit: string; icon: string }
    | { kind: 'jar'; fill: number; capacity: number }
    | {
          kind: 'grid';
          rows: number;
          cols: number;
          start: Cell;
          target: Cell | null;
          obstacles: Cell[];
      };

/* ---------- Questions ---------- */

export type Option = { id: string; label: string; visual?: Visual };

type Base<T extends string, D> = {
    id: number;
    type: T;
    text: string;
    data: D;
    difficulty: number;
    objective: string;
    points: number;
    has_hint: boolean;
};

export type ChoiceQuestion = Base<
    'choice',
    { options: Option[]; keep_order?: boolean; visual?: Visual }
>;
export type NumberQuestion = Base<'number', { visual?: Visual; unit?: string }>;
export type MissingQuestion = Base<
    'missing',
    | {
          layout: 'equation' | 'sequence';
          tokens: (number | string | null)[];
          visual?: Visual;
      }
    | { layout: 'wall'; rows: (number | null)[][] }
>;
export type MatchQuestion = Base<
    'match',
    { left: Option[]; right: Option[]; many_to_one: boolean }
>;
export type OrderQuestion = Base<
    'order',
    {
        items: Option[];
        direction: 'asc' | 'desc';
        first_label: string;
        last_label: string;
    }
>;
export type PlaceValueQuestion = Base<'place_value', { target: number }>;
export type ClockSetQuestion = Base<'clock_set', { minute_step: number }>;
export type SymmetryQuestion = Base<
    'symmetry',
    {
        rows: number;
        cols: number;
        axis: 'vertical' | 'horizontal';
        given: Cell[];
    }
>;
export type RouteBuildQuestion = Base<
    'route_build',
    {
        rows: number;
        cols: number;
        start: Cell;
        target: Cell;
        obstacles: Cell[];
    }
>;
export type RouteFollowQuestion = Base<
    'route_follow',
    { rows: number; cols: number; start: Cell; obstacles: Cell[] }
>;
export type MoneyQuestion = Base<
    'money',
    { target: number; denominations: number[]; unit: string }
>;
export type CompareQuestion = Base<'compare', { left: string; right: string }>;

export type Question =
    | ChoiceQuestion
    | NumberQuestion
    | MissingQuestion
    | MatchQuestion
    | OrderQuestion
    | PlaceValueQuestion
    | ClockSetQuestion
    | SymmetryQuestion
    | RouteBuildQuestion
    | RouteFollowQuestion
    | MoneyQuestion
    | CompareQuestion;

export type AnswerPayload = Record<string, unknown>;

export type QuestionState = {
    tries: number;
    tries_left: number;
    resolved: boolean;
    correct: boolean;
    points: number;
    hint: string | null;
    explanation: string | null;
    reveal: string | null;
    reveal_answer?: Record<string, unknown> | null;
};

export type AttemptQuestion = {
    position: number;
    question: Question;
    state: QuestionState;
};

export type AnswerResult = {
    question_id: number;
    correct: boolean;
    duplicate: boolean;
    points: number;
    tries: number;
    tries_left: number;
    resolved: boolean;
    hint: string | null;
    explanation: string | null;
    reveal: string | null;
    reveal_answer: Record<string, unknown> | null;
    attempt: {
        score: number;
        answered: number;
        total: number;
        all_resolved: boolean;
    };
};

/** Props every activity component receives. */
export type ActivityProps<Q extends Question> = {
    question: Q;
    disabled: boolean;
    onChange: (answer: AnswerPayload | null) => void;
    revealAnswer?: Record<string, unknown> | null;
};
