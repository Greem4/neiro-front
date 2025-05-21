const API_URL = import.meta.env.VITE_API_URL ?? '';

export async function api(
    path,
    { method = 'GET', body, auth = true, ...rest } = {},
) {
    const headers = { ...(rest.headers || {}) };

    if (!(body instanceof FormData) && method !== 'GET') {
        headers['Content-Type'] = 'application/json';
    }

    /* ---------- JWT ---------- */
    if (auth) {
        const token = localStorage.getItem('token');
        if (token) {
            headers.Authorization = token.startsWith('Bearer ')
                ? token                    // токен уже содержит префикс
                : `Bearer ${token}`;       // добавляем префикс
        }
    }

    const res = await fetch(`${API_URL}${path}`, {
        method,
        headers,
        body:
            body instanceof FormData
                ? body
                : body !== undefined
                    ? JSON.stringify(body)
                    : undefined,
        ...rest,
    });

    if (res.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
    }

    if (!res.ok) throw new Error(await res.text());
    return res.status === 204 ? null : res.json();
}
