import React from 'react';
import ReactDOM from 'react-dom/client';

// Стили
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Auth-контекст
import { AuthProvider } from '@/auth/AuthContext.jsx';

// HashRouter вместо BrowserRouter
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <AuthProvider>
            <HashRouter>
                <App />
            </HashRouter>
        </AuthProvider>
    </React.StrictMode>
);
