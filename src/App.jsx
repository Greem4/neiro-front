/**
 * Помещаем этот файл в `src/App.jsx`.
 * Главный компонент, который рендерит страницу с календарём.
 * При желании вы можете расширить это приложение под Router, создавать другие страницы и т.д.
 */

import React from 'react'
import CalendarPage from './components/CalendarPage.jsx'

function App() {
    return (
        <div>
            <CalendarPage />
        </div>
    )
}

export default App
