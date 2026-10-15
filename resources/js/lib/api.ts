export class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public sessionExpired = false,
    ) {
        super(message);
    }
}

function xsrfToken(): string | null {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);

    return match ? decodeURIComponent(match[1]) : null;
}

/**
 * JSON POST for in-page game actions (answers, hints). Uses Laravel's
 * XSRF-TOKEN cookie so the token stays valid after session regeneration.
 */
export async function postJson<T>(url: string, body: unknown = {}): Promise<T> {
    const headers: Record<string, string> = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    };
    const token = xsrfToken();

    if (token) {
        headers['X-XSRF-TOKEN'] = token;
    }

    let response: Response;

    try {
        response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
            credentials: 'same-origin',
        });
    } catch {
        throw new ApiError('تعذّر الاتصال. تأكّد من الإنترنت ثم حاول مرة أخرى.', 0);
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const firstError = data?.errors
            ? (Object.values(data.errors as Record<string, string[]>)[0]?.[0] ??
              null)
            : null;

        const message =
            response.status === 419
                ? 'انتهت صلاحية الصفحة. حدّث الصفحة وتابع.'
                : response.status === 429
                  ? 'تمهّل قليلاً! انتظر لحظة ثم حاول مرة أخرى.'
                  : (firstError ??
                    data?.message ??
                    'حدث خطأ غير متوقع. حاول مرة أخرى.');

        throw new ApiError(
            message,
            response.status,
            Boolean(data?.session_expired) || response.status === 401,
        );
    }

    return data as T;
}
