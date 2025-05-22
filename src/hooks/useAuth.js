// src/hooks/useAuth.js
import { useState, useCallback, useMemo } from 'react'
// Импортируем весь пакет — у него может быть module.exports = fn или export default fn
import * as jwt from 'jwt-decode'

// Берём функцию декодирования: либо default, либо сам namespace
const jwtDecode = jwt.default ?? jwt

export default function useAuth() {
    const [token, setToken] = useState(() => localStorage.getItem('token'))

    const user = useMemo(() => {
        if (!token) return null

        try {
            return jwtDecode(token)
        } catch {
            // если вдруг невалидный токен, сбрасываем
            localStorage.removeItem('token')
            setToken(null)
            return null
        }
    }, [token])

    const login = useCallback(t => {
        localStorage.setItem('token', t)
        setToken(t)
    }, [])

    const logout = useCallback(() => {
        localStorage.removeItem('token')
        setToken(null)
    }, [])

    return {
        token,
        user,
        login,
        logout,
        isAuth: Boolean(token),
    }
}
