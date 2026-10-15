import type { ActivityProps, AnswerPayload, Question } from '@/types';
import { ChoiceActivity } from './choice-activity';
import { ClockSetActivity } from './clock-set-activity';
import { CompareActivity } from './compare-activity';
import { MatchActivity } from './match-activity';
import { MissingActivity } from './missing-activity';
import { MoneyActivity } from './money-activity';
import { NumberActivity } from './number-activity';
import { OrderActivity } from './order-activity';
import { PlaceValueActivity } from './place-value-activity';
import { RouteBuildActivity } from './route-build-activity';
import { RouteFollowActivity } from './route-follow-activity';
import { SymmetryActivity } from './symmetry-activity';

/** Answer a question starts with before the student interacts (null = not ready). */
export function initialAnswer(question: Question): AnswerPayload | null {
    return question.type === 'order'
        ? { order: question.data.items.map((i) => i.id) }
        : null;
}

export function ActivityRenderer(props: ActivityProps<Question>) {
    const { question } = props;

    switch (question.type) {
        case 'choice':
            return <ChoiceActivity {...props} question={question} />;
        case 'number':
            return <NumberActivity {...props} question={question} />;
        case 'missing':
            return <MissingActivity {...props} question={question} />;
        case 'match':
            return <MatchActivity {...props} question={question} />;
        case 'order':
            return <OrderActivity {...props} question={question} />;
        case 'place_value':
            return <PlaceValueActivity {...props} question={question} />;
        case 'clock_set':
            return <ClockSetActivity {...props} question={question} />;
        case 'symmetry':
            return <SymmetryActivity {...props} question={question} />;
        case 'route_build':
            return <RouteBuildActivity {...props} question={question} />;
        case 'route_follow':
            return <RouteFollowActivity {...props} question={question} />;
        case 'money':
            return <MoneyActivity {...props} question={question} />;
        case 'compare':
            return <CompareActivity {...props} question={question} />;
        default:
            return (
                <p className="text-center text-coral-500">
                    نوع سؤال غير معروف.
                </p>
            );
    }
}
