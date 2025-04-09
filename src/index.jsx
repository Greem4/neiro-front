// src/index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';

// Подключаем стили Bootstrap (CSS):
import 'bootstrap/dist/css/bootstrap.min.css';
// Подключаем Bootstrap Icons:
import 'bootstrap-icons/font/bootstrap-icons.css';

// Импортируем наш компонент календаря
import CalendarPage from './CalendarPage.jsx';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';


const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

// Рендерим приложение
root.render(
    <React.StrictMode>
        <CalendarPage />
    </React.StrictMode>
);
