// src/auth/LogoutButton.jsx   (или src/components/LogoutButton.jsx — где лежит)
import React from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth }   from '@/auth/AuthContext.jsx';

import '../styles/_logout-button.scss';

export default function LogoutButton() {
    const { logout, isAuth } = useAuth();
    const navigate            = useNavigate();

    if (!isAuth) return null;

    return (
        <button
            type="button"
            className="btn-logout"
            onClick={() => { logout(); navigate('/login'); }}
            title="Выйти"
        >
            <LogOut size={14} /> Выйти
        </button>
    );
}
