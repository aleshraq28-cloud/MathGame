import type { SharedStudent, SharedTeacher } from '@/types';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            student: SharedStudent;
            teacher: SharedTeacher;
            teacher_name: string;
            flash: { notice: string | null };
            [key: string]: unknown;
        };
    }
}
