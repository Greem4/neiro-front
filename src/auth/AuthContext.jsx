import React, {
    createContext,
    useContext,
    useState,
    useMemo,
    useCallback,
} from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    // при старте берём токен из localStorage
    const [token, setToken] = useState(() => localStorage.getItem('token'));

    /* ----------- методы ----------- */
    const login = useCallback((t) => {
        localStorage.setItem('token', t);
        setToken(t);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setToken(null);
    }, []);

    /* ----------- объект, который получат компоненты ----------- */
    const value = useMemo(
        () => ({
            token,
            user: token ? jwtDecode(token) : null,
            isAuth: !!token,
            login,
            logout,
        }),
        [token, login, logout],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* ----------- хук для использования ----------- */
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
}
