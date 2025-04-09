/**
 * Помещаем этот файл в `src/main.jsx`.
 * Точка входа приложения, где мы "включаем" React.
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'  // Импортируем главный компонент приложения
import './index.css'         // Можно подключать общие стили
import 'bootstrap/dist/css/bootstrap.min.css';


ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
