import React, { useState } from 'react';
import { api } from '@/api/client';
import { Link, useNavigate } from 'react-router-dom';

export default function RegisterPage() {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        const { username, password } = Object.fromEntries(new FormData(e.target));

        try {
            await api('/api/v1/auth/register', {
                method: 'POST',
                body: { username, password },
                auth: false,
            });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            setError(err.message || 'Ошибка регистрации');
        }
    }

    return (
        <div className="container py-5">
            <h1 className="mb-4">Регистрация</h1>
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
                {success && (
                    <div className="text-success mb-3">Успешно! Перенаправляем…</div>
                )}
                <button className="btn btn-primary w-100">Создать аккаунт</button>
                <p className="mt-3 mb-0">
                    Уже есть аккаунт? <Link to="/login">Войти</Link>
                </p>
            </form>
        </div>
    );
}
