import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';               // Наши глобальные стили
import 'bootstrap/dist/css/bootstrap.min.css';  // Стили Bootstrap
import 'bootstrap-icons/font/bootstrap-icons.css'; // Иконки (если нужны)

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
