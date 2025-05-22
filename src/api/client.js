// обёртка над fetch, которая по-умолчанию подставляет JWT
export async function api(
    url,
    {
        method = 'GET',
        body   = null,
        headers = {},
        auth   = true,          // auth:false → запрос без Authorization
    } = {},
) {
    const cfg = { method, headers: { ...headers } };

    /* ---------- тело запроса ---------- */
    if (body !== null) {
        if (body instanceof FormData) {
            cfg.body = body;                    // let browser set boundaries
        } else {
            cfg.headers['Content-Type'] = 'application/json';
            cfg.body = JSON.stringify(body);
        }
    }

    /* ---------- Authorization ---------- */
    if (auth) {
        const token = localStorage.getItem('token');
        if (token) cfg.headers.Authorization = `Bearer ${token}`;
    }

    const resp = await fetch(url, cfg);

    if (!resp.ok) {
        const msg = await resp.text();
        throw new Error(msg || resp.statusText);
    }

    const ct = resp.headers.get('Content-Type') || '';
    return ct.includes('application/json') ? resp.json() : resp;
}
