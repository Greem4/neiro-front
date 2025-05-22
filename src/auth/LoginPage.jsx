import React, { useState } from 'react';
import { api } from '@/api/client';
import { useAuth } from '@/auth/AuthContext.jsx';   // ← новый импорт
import { Link, useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        const { username, password } = Object.fromEntries(new FormData(e.target));

        try {
            const resp = await api('/api/v1/auth/login', {
                method: 'POST',
                body: { username, password },
                auth: false,
            });

            /* ---- у бэка поле называется token ---- */
            const token = resp.token || resp.accessToken;
            if (!token) throw new Error('Сервер не вернул token');

            login(token);
            navigate('/calendar');
        } catch (err) {
            setError(err.message || 'Ошибка входа');
        }
    }

    return (
        <div className="container py-5">
            <h1 className="mb-4">Вход</h1>
            <form onSubmit={handleSubmit} className="w-100" style={{ maxWidth: 320 }}>
                <div className="mb-3">
                    <input
                        name="username"
                        className="form-control"
                        placeholder="Имя пользователя"
                        required
                    />
                </div>
                <div className="mb-3">
                    <input
                        name="password"
                        type="password"
                        className="form-control"
                        placeholder="Пароль"
                        required
                    />
                </div>
                {error && <div className="text-danger mb-3">{error}</div>}
                <button className="btn btn-primary w-100">Войти</button>
                <p className="mt-3 mb-0">
                    Нет аккаунта? <Link to="/register">Регистрация</Link>
                </p>
            </form>
        </div>
    );
}
