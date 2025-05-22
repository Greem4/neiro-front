import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage    from "@/auth/LoginPage.jsx";
import RegisterPage from "@/auth/RegisterPage.jsx";
import CalendarPage from "@/components/CalendarPage.jsx";
import { useAuth }  from "@/auth/AuthContext.jsx";

function ProtectedRoute({ children }) {
    const { isAuth } = useAuth();
    return isAuth ? children : <Navigate to="/login" replace />;
}

export default function App() {
    return (
        <Routes>
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route
                path="/calendar"
                element={
                    <ProtectedRoute>
                        <CalendarPage />
                    </ProtectedRoute>
                }
            />

            {/* всё остальное — на /calendar */}
            <Route path="*" element={<Navigate to="/calendar" replace />} />
        </Routes>
    );
}
