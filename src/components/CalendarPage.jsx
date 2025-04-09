/**
 * Помещаем этот файл в `src/components/CalendarPage.jsx`.
 * Здесь располагается основная логика:
 * - Форма выбора месяца/года
 * - Запросы к REST API
 * - Отрисовка таблицы календаря
 * - Добавление/удаление/изменение записей
 */

import React, { useEffect, useState } from 'react'

// Список дней на русском, используем те, которые выводим в шапке
// Текущий контроллер возвращает ["Вт", "Чт", "Пт", "Вс"]
// В соответствие имён weekday c локализацией можно добавить собственные соответствия.
const RUS_WEEKDAYS = ["Вт", "Чт", "Пт", "Вс"]

function CalendarPage() {
    // Состояния для даты
    const currentDate = new Date()
    const [year, setYear] = useState(currentDate.getFullYear())
    const [month, setMonth] = useState(currentDate.getMonth() + 1) // JS: месяц 0-11, на REST: 1-12

    // Данные, которые вернёт наш API
    const [weeks, setWeeks] = useState([])            // weeks — массив массивов дней
    const [allowedDays, setAllowedDays] = useState([]) // какие дни недели разрешены
    const [monthNames, setMonthNames] = useState({})   // map: 1 -> 'Январь', 2 -> 'Февраль' и т.д.
    const [attendedCount, setAttendedCount] = useState(0)

    // Дополнительно, если у вас в ответе есть "totalCost" — сохраняем:
    // const [totalCost, setTotalCost] = useState(0)

    // При загрузке или при изменении [month, year] — делаем запрос
    useEffect(() => {
        fetchCalendarData()
    }, [month, year])

    // Функция получения данных календаря
    const fetchCalendarData = async () => {
        try {
            // Формируем URL с параметрами
            const response = await fetch(
                `/api/v1/calendar?year=${year}&month=${month}`
            )
            if (!response.ok) {
                throw new Error('Ошибка при получении данных календаря')
            }
            const data = await response.json()
            // Сохраняем данные
            setWeeks(data.weeks)
            setAllowedDays(data.allowedDays)
            setMonthNames(data.monthNames)
            setAttendedCount(data.attendedCount)
            // Если контроллер будет возвращать totalCost, раскомментируйте:
            // setTotalCost(data.totalCost ?? 0)
        } catch (error) {
            console.error('Ошибка:', error)
        }
    }

    // Обработчик изменения статуса посещаемости
    const toggleAttendance = async (record) => {
        try {
            const url = record.attended
                ? '/api/v1/calendar/uncheck'
                : '/api/v1/calendar/check'
            const formData = new FormData()
            formData.append('recordId', record.id)

            // Так как в контроллере check/uncheck — POST (форма), шлём так:
            await fetch(url, {
                method: 'POST',
                body: formData,
            })
            // После изменения делаем обновление данных
            await fetchCalendarData()
        } catch (error) {
            console.error('Ошибка:', error)
        }
    }

    // Удалить запись
    const deleteRecord = async (recordId) => {
        try {
            // В контроллере удаление — DELETE, но параметр идёт в query или formData?
            // У вас @RequestParam, поэтому можно отправить formData или queryString
            // Ниже вариант с queryString:
            const response = await fetch(`/api/v1/calendar/delete?recordId=${recordId}`, {
                method: 'DELETE',
            })
            if (!response.ok) {
                throw new Error('Ошибка при удалении записи')
            }
            // После удаления пересчитываем
            await fetchCalendarData()
        } catch (error) {
            console.error('Ошибка:', error)
        }
    }

    // Добавить нового человека на дату
    const addAttendance = async (event, date) => {
        event.preventDefault()
        const form = event.target
        const personName = form.personName.value
        if (!personName) return

        try {
            const formData = new FormData()
            formData.append('personName', personName)
            formData.append('date', date)

            const response = await fetch('/api/v1/calendar/add', {
                method: 'POST',
                body: formData,
            })
            if (!response.ok) {
                throw new Error('Ошибка при добавлении записи')
            }
            // Очищаем поле
            form.reset()
            // Обновляем таблицу
            await fetchCalendarData()
        } catch (error) {
            console.error('Ошибка:', error)
        }
    }

    // Функция отправки формы выбора месяца/года (чтобы не было перезагрузки)
    const handleMonthYearSubmit = (e) => {
        e.preventDefault()
        // Просто вызываем fetchCalendarData — в useEffect оно сработает при изменении month, year
        fetchCalendarData()
    }

    // Сформируем опции для select - месяц
    // monthNames — объект, например: {1:'Январь', 2:'Февраль',...}
    const monthOptions = Object.entries(monthNames).map(([num, name]) => (
        <option key={num} value={num}>
            {name}
        </option>
    ))

    return (
        <div className="calendar-container">
            <h1>Календарь занятий</h1>

            {/** Форма выбора месяца и года */}
            <form onSubmit={handleMonthYearSubmit} className="form-switch">
                <label>
                    Месяц:
                    <select
                        name="month"
                        value={month}
                        onChange={(e) => setMonth(Number(e.target.value))}
                    >
                        {monthOptions}
                    </select>
                </label>

                <label>
                    Год:
                    <input
                        type="number"
                        name="year"
                        min="2020"
                        max="2100"
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                    />
                </label>

                <button type="submit">Показать</button>
            </form>

            <p>
                Выбран: <strong>{month}/{year}</strong>
            </p>

            {/** Таблица календаря */}
            <table className="calendar-table">
                <thead>
                <tr>
                    {RUS_WEEKDAYS.map((dayName) => (
                        <th key={dayName}>{dayName}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {/** weeks — массив недель, где каждая неделя — массив объектов (cell) */}
                {weeks.map((week, weekIndex) => {
                    // В одной "неделе" может быть 7 ячеек, но мы выводим только те,
                    // что входят в allowedDays
                    // Причём нам нужно расположить их в порядке: Вт, Чт, Пт, Вс
                    // Можно сделать небольшой объект dayMap, где ключ — день недели (число) и значение — cell
                    // А потом рендерить колонки в строгом порядке [2,4,5,7] (Вт=2, Чт=4, Пт=5, Вс=7)

                    // Создадим словарь dayOfWeek -> cell
                    // dayOfWeek в Java: 1=MONDAY...7=SUNDAY
                    // Будем ориентироваться, что Вт=2, Чт=4, Пт=5, Вс=7
                    const dayMap = {}
                    week.forEach((cell) => {
                        const dayOfWeek = new Date(cell.date).getDay() // JS: 0=Вс,1=Пн,2=Вт,...
                        // Но у вас в бэке dayOfWeek наверняка ISO (1=Mon...7=Sun).
                        // Если так, может нужно использовать cell.date().getDayOfWeek()?
                        // Но т.к. JSON приходит строкой, в JS new Date().getDay() будет 0-6
                        // Ниже — пример перевода. Нужно аккуратно сверить.
                        // Если у вас реальные данные, возможно проще хранить dayOfWeek на бэке
                        // и передавать его напрямую. Для упрощения считаем: 2=Вт,4=Чт,5=Пт,0=Вс (JS)
                        // Но это зависит от локального времени.
                        // Для примера просто сохраним по дате:
                        dayMap[dayOfWeek] = cell
                    })

                    // Порядок вывода во фронте: Вт(2), Чт(4), Пт(5), Вс(0).
                    // Но нужно помнить: в JS Date.getDay() === 0 -> Воскресенье
                    // Так что массив будет [2,4,5,0]
                    const order = [2, 4, 5, 0]

                    return (
                        <tr key={weekIndex}>
                            {order.map((dow) => {
                                const cell = dayMap[dow]
                                if (!cell) {
                                    // Если нет ячейки — показываем пустую
                                    return <td key={dow} className="outside"></td>
                                }

                                // Проверяем, входит ли dayOfWeek в разрешённые
                                // На бэке allowedDays, например, ["TUESDAY","THURSDAY","FRIDAY","SUNDAY"].
                                // Нам нужно сопоставление. Для упрощения допустим, что если у нас есть cell,
                                // значит это разрешённый день. Или можно дополнительно сверять:
                                // if (!allowedDays.includes(...)) return null

                                // Определим, считается ли день "текущим месяцем" (cell.inCurrentMonth())
                                // У нас в JSON может быть флаг inCurrentMonth или нет.
                                // Предположим, что cell.inCurrentMonth = true/false
                                const tdClass = cell.inCurrentMonth ? 'current-month' : 'outside'

                                return (
                                    <td key={dow} className={tdClass}>
                                        <div className="day-number">
                                            {new Date(cell.date).getDate()}
                                        </div>

                                        <ul className="records">
                                            {cell.records.map((record) => (
                                                <li
                                                    key={record.id}
                                                    className={record.attended ? 'attended' : ''}
                                                >
                                                    {/** Имя */}
                                                    <span className="record-name">{record.personName}</span>
                                                    <span className="record-status">
                              {record.attended ? ' (Да)' : ' (Нет)'}
                            </span>
                                                    {/** Кнопки */}
                                                    <div className="btn-group">
                                                        <button
                                                            className="toggle-btn"
                                                            onClick={() => toggleAttendance(record)}
                                                        >
                                                            {record.attended ? 'Не был' : 'Был'}
                                                        </button>

                                                        <button
                                                            className="delete-btn"
                                                            onClick={() => deleteRecord(record.id)}
                                                        >
                                                            ✖
                                                        </button>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>

                                        {/** Форма добавления человека */}
                                        <div className="add-form">
                                            <form onSubmit={(e) => addAttendance(e, cell.date)}>
                                                <input
                                                    type="text"
                                                    name="personName"
                                                    placeholder="Имя"
                                                    required
                                                />
                                                <button type="submit" className="add-btn">
                                                    Добавить
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                )
                            })}
                        </tr>
                    )
                })}
                </tbody>
            </table>

            <hr />

            <div className="summary">
                <p>Отмеченных посещений: <strong>{attendedCount}</strong></p>
                {/** Если есть totalCost на сервере, добавьте */}
                {/*
        <p>Итоговая сумма: <strong>{totalCost}</strong> руб.</p>
        */}
            </div>
        </div>
    )
}

export default CalendarPage
