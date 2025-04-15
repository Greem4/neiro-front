import React, { useEffect, useState } from 'react'
import { Check, X, Trash2 } from 'lucide-react'

// Русские будни и порядок их отображения
const RUS_WEEKDAYS = ['Вт', 'Чт', 'Пт', 'Вс']
// Соответствующие числовые коды дней (JS): вторник=2, четверг=4, пятница=5, воскресенье=0
const dayOrder = [2, 4, 5, 0]

/**
 * Хук для определения, являемся ли мы "мобильным" устройством
 * (например, ширина экрана меньше 576px).
 */
function useIsMobile() {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 576)

    useEffect(() => {
        function handleResize() {
            setIsMobile(window.innerWidth < 576)
        }
        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    return isMobile
}

function CalendarPage() {
    const now = new Date()
    const [year, setYear] = useState(now.getFullYear())
    const [month, setMonth] = useState(now.getMonth() + 1)

    const [weeks, setWeeks] = useState([])
    const [allowedDays, setAllowedDays] = useState([])
    const [monthNames, setMonthNames] = useState({})
    const [attendedCount, setAttendedCount] = useState(0)
    const [totalCost, setTotalCost] = useState(0)

    // Состояния для всплывающего окна (tooltip) со сводкой по дню
    const [tooltipVisible, setTooltipVisible] = useState(false)
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
    const [dailySummary, setDailySummary] = useState(null)
    const [selectedDate, setSelectedDate] = useState('')

    // ---------- ВАЖНО: локальные изменения статусов посещения ----------
    // Ключ = record.id, значение = true (посетил) или false (не посетил).
    // Если ключа нет, значит никаких локальных изменений по этому record нет.
    const [pendingAttendance, setPendingAttendance] = useState({})

    // Определяем, нужно ли использовать мобильное представление
    const isMobile = useIsMobile()

    useEffect(() => {
        fetchCalendarData()
    }, [month, year])

    const fetchCalendarData = async () => {
        try {
            const response = await fetch(`/api/v1/calendar?year=${year}&month=${month}`)
            if (!response.ok) throw new Error('Ошибка при получении данных календаря')
            const data = await response.json()
            setWeeks(data.weeks)
            setAllowedDays(data.allowedDays)
            setMonthNames(data.monthNames)
            setAttendedCount(data.attendedCount)
            setTotalCost(data.totalCost)
        } catch (error) {
            console.error('Ошибка:', error)
        }
    }

    // Открыть tooltip со сводкой
    const openSummaryTooltip = async (event, date) => {
        event.stopPropagation()
        setSelectedDate(date)
        const rect = event.target.getBoundingClientRect()
        setTooltipPosition({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height + 5,
        })
        const formattedDate = new Date(date).toISOString().split('T')[0]
        try {
            const response = await fetch(`/api/v1/calendar/daily-summary?start=${formattedDate}&end=${formattedDate}`)
            if (!response.ok) throw new Error('Ошибка при получении данных сводки')
            const data = await response.json()
            if (data && data.length > 0) {
                setDailySummary(data[0])
            } else {
                setDailySummary({ attendedCount: 0, earnings: 0 })
            }
            setTooltipVisible(true)
        } catch (error) {
            console.error('Ошибка при получении сводки для даты', date, error)
        }
    }

    // Закрыть tooltip
    const closeTooltip = () => {
        setTooltipVisible(false)
    }

    // ---------- РАНЬШЕ БЫЛИ setAttended / setNotAttended (убрали, делаем "отложенно") ----------

    // Локально меняем статус присутствия (true/false) в pendingAttendance, без запроса к серверу
    const toggleAttendanceLocally = (record) => {
        const recordId = record.id
        // Текущее локальное значение, если его нет, берём с сервера (record.attended)
        const currentAttended = pendingAttendance.hasOwnProperty(recordId)
            ? pendingAttendance[recordId]
            : record.attended

        // Переключаем
        const newValue = !currentAttended

        setPendingAttendance((prev) => ({
            ...prev,
            [recordId]: newValue,
        }))
    }

    // Кнопка "Сохранить" — отправляет все локально накопленные изменения на сервер
    const saveChanges = async () => {
        try {
            const recordIds = Object.keys(pendingAttendance)
            if (recordIds.length === 0) {
                // Нет изменений — выходим
                return
            }
            // Шлем все изменения (каждое в отдельном запросе или через bulk API, если есть)
            for (const recordId of recordIds) {
                const shouldAttend = pendingAttendance[recordId]
                const formData = new FormData()
                formData.append('recordId', recordId)

                if (shouldAttend) {
                    // Ставим "присутствовал"
                    await fetch('/api/v1/calendar/check', {
                        method: 'POST',
                        body: formData,
                    })
                } else {
                    // Ставим "не присутствовал"
                    await fetch('/api/v1/calendar/uncheck', {
                        method: 'POST',
                        body: formData,
                    })
                }
            }

            // После сохранения — очищаем локальные изменения
            setPendingAttendance({})

            // И обновляем календарь
            await fetchCalendarData()
        } catch (error) {
            console.error('Ошибка при сохранении изменений:', error)
        }
    }

    // Удалить запись
    const deleteRecord = async (recordId) => {
        try {
            const response = await fetch(`/api/v1/calendar/delete?recordId=${recordId}`, {
                method: 'DELETE',
            })
            if (!response.ok) throw new Error('Ошибка при удалении записи')
            await fetchCalendarData()
        } catch (error) {
            console.error('Ошибка:', error)
        }
    }

    // Добавить новую запись
    const addAttendance = async (event, date) => {
        event.preventDefault()
        const form = event.target
        const personName = form.personName.value.trim()
        if (!personName) return

        try {
            const formData = new FormData()
            formData.append('personName', personName)
            formData.append('date', date)

            const response = await fetch('/api/v1/calendar/add', {
                method: 'POST',
                body: formData,
            })
            if (!response.ok) throw new Error('Ошибка при добавлении записи')
            form.reset()
            await fetchCalendarData()
        } catch (error) {
            console.error('Ошибка:', error)
        }
    }

    const handleMonthYearSubmit = (e) => e.preventDefault()

    const monthOptions = Object.entries(monthNames).map(([num, name]) => (
        <option key={num} value={num}>
            {name}
        </option>
    ))

    // Функция, которая отрисовывает ячейку дня
    const renderDayCell = (cell) => {
        if (!cell || !cell.inCurrentMonth) {
            // Пустая ячейка
            return <td style={{ minWidth: '120px' }} />
        }
        return (
            <td
                key={cell.date}
                className={cell.inCurrentMonth ? '' : 'bg-light'}
                style={{ minWidth: '120px', verticalAlign: 'top' }}
            >
                <div className="d-flex flex-column p-1" style={{ minHeight: '150px' }}>
                    {/* Номер дня (с onclick для tooltip) */}
                    <div
                        className="fw-bold mb-2"
                        style={{ cursor: 'pointer' }}
                        onClick={(e) => openSummaryTooltip(e, cell.date)}
                    >
                        {new Date(cell.date).getDate()}
                    </div>

                    {/* Список записей */}
                    <ul className="list-unstyled flex-grow-1">
                        {cell.records.map((record) => {
                            // Смотрим, не изменён ли локально статус присутствия
                            const localAttended = pendingAttendance.hasOwnProperty(record.id)
                                ? pendingAttendance[record.id]
                                : record.attended

                            return (
                                <li key={record.id} className="mb-2">
                                    <div className="d-flex align-items-center justify-content-between">
                      <span className={localAttended ? 'fw-bold text-success' : ''}>
                        {record.personName}
                      </span>
                                        <div className="d-flex gap-1">
                                            {/* Кнопка переключения статуса (теперь одна и та же функция) */}
                                            {localAttended ? (
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-success"
                                                    onClick={() => toggleAttendanceLocally(record)}
                                                    title="Отметить как не был"
                                                >
                                                    <Check size={16} />
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => toggleAttendanceLocally(record)}
                                                    title="Отметить как был"
                                                >
                                                    <X size={16} />
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-secondary"
                                                onClick={() => deleteRecord(record.id)}
                                                title="Удалить запись"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>

                    {/* Форма добавления новой записи */}
                    <form onSubmit={(e) => addAttendance(e, cell.date)} className="mt-auto d-flex">
                        <input
                            type="text"
                            name="personName"
                            className="form-control form-control-sm me-1"
                            placeholder="Имя"
                            required
                        />
                        <button type="submit" className="btn btn-sm btn-outline-primary">
                            +
                        </button>
                    </form>
                </div>
            </td>
        )
    }

    // Стили для tooltip
    const tooltipStyle = {
        position: 'fixed',
        top: tooltipPosition.y,
        left: tooltipPosition.x,
        transform: 'translate(-50%, 0)',
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '10px 15px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        zIndex: 1000,
        minWidth: '180px',
        maxWidth: 'calc(100% - 20px)', // не вылезает за края
        margin: '0 10px',              // отступ по бокам
    }

    // Фоновый слой для закрытия tooltip при клике вне
    const backdropStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 900,
    }

    // ======= Адаптивная шапка =======
    const Header = (
        <nav className="navbar navbar-dark bg-primary shadow-sm">
            <div className="container-fluid flex-column flex-sm-row align-items-start align-items-sm-center py-2 gap-2">
                <span className="navbar-brand fw-bold">Мои занятия</span>

                {/* Блок выбора месяца и года */}
                <form
                    onSubmit={handleMonthYearSubmit}
                    className="d-flex flex-wrap gap-2"
                >
                    <div>
                        <label className="form-label mb-1 text-white-50">Месяц:</label>
                        <select
                            className="form-select form-select-sm"
                            value={month}
                            onChange={(e) => setMonth(Number(e.target.value))}
                        >
                            {monthOptions}
                        </select>
                    </div>

                    <div>
                        <label className="form-label mb-1 text-white-50">Год:</label>
                        <input
                            type="number"
                            className="form-control form-control-sm"
                            min="2020"
                            max="2100"
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                        />
                    </div>

                    <div className="align-self-end">
                        <button type="submit" className="btn btn-light btn-sm">
                            Показать
                        </button>
                    </div>
                </form>

                {/* Блок с суммарной информацией + кнопка "Сохранить" */}
                <div className="ms-sm-auto d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-3">
                    <div className="text-white-50 d-flex flex-column align-items-start align-items-sm-end">
                        <div>
                            Посещений: <strong className="text-white">{attendedCount}</strong>
                        </div>
                        <div>
                            Сумма: <strong className="text-white">{totalCost}</strong> руб.
                        </div>
                    </div>

                    <button type="button" className="btn btn-warning btn-sm" onClick={saveChanges}>
                        Сохранить
                    </button>
                </div>
            </div>
        </nav>
    )

    // ======= Разметка для 4 колонок (десктоп) =======
    const DesktopTable = (
        <div className="table-responsive px-2 py-3">
            <table className="table table-bordered align-middle text-center mb-3">
                <thead className="table-secondary">
                <tr>
                    {RUS_WEEKDAYS.map((day) => (
                        <th key={day}>{day}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {weeks.map((week, weekIndex) => {
                    // Собираем информацию о ячейках, где ключ = dayOfWeek
                    const dayMap = {}
                    week.forEach((cell) => {
                        const jsDay = new Date(cell.date).getDay()
                        dayMap[jsDay] = cell
                    })
                    return (
                        <tr key={weekIndex}>
                            {dayOrder.map((dow) => {
                                const cell = dayMap[dow]
                                return renderDayCell(cell)
                            })}
                        </tr>
                    )
                })}
                </tbody>
            </table>
        </div>
    )

    // ======= Разметка для 2 колонок (мобильная) =======
    // Для двух столбцов сгруппируем dayOrder в пары: [ [2,4], [5,0] ]
    const mobilePairs = [
        [dayOrder[0], dayOrder[1]], // [2, 4]
        [dayOrder[2], dayOrder[3]], // [5, 0]
    ]

    const MobileTable = (
        <div className="table-responsive px-2 py-3">
            <table className="table table-bordered align-middle text-center mb-3">
                <thead className="table-secondary">
                <tr>
                    <th>{RUS_WEEKDAYS[0]}</th>
                    <th>{RUS_WEEKDAYS[1]}</th>
                </tr>
                </thead>
                <tbody>
                {weeks.map((week, weekIndex) => {
                    const dayMap = {}
                    week.forEach((cell) => {
                        const jsDay = new Date(cell.date).getDay()
                        dayMap[jsDay] = cell
                    })

                    // Каждая "неделя" будет разбита ещё на 2 строки (по 2 дня в строке)
                    return mobilePairs.map((pair, pairIndex) => (
                        <tr key={weekIndex + '-' + pairIndex}>
                            {pair.map((dow) => {
                                const cell = dayMap[dow]
                                return renderDayCell(cell)
                            })}
                        </tr>
                    ))
                })}
                </tbody>
            </table>
        </div>
    )

    return (
        <div className="calendar-page" onClick={closeTooltip}>
            {Header}

            {/* Выводим либо 4-колоночную (десктоп), либо 2-колоночную (мобильную) вёрстку */}
            {isMobile ? MobileTable : DesktopTable}

            {/* Фоновый слой для закрытия tooltip при клике вне */}
            {tooltipVisible && <div style={backdropStyle} onClick={closeTooltip} />}

            {/* Всплывающее окно (tooltip) со сводкой по дню */}
            {tooltipVisible && (
                <div style={tooltipStyle} onClick={(e) => e.stopPropagation()}>
                    <h5 style={{ marginBottom: '8px' }}>
                        Сводка за {new Date(selectedDate).toLocaleDateString()}
                    </h5>
                    {dailySummary ? (
                        <>
                            <p style={{ margin: '4px 0' }}>
                                Записей: <strong>{dailySummary.totalCount}</strong>
                            </p>
                            <p style={{ margin: '4px 0' }}>
                                Пришли: <strong>{dailySummary.attendedCount}</strong>
                            </p>
                            <p style={{ margin: '4px 0' }}>
                                Заработано: <strong>{dailySummary.earnings}</strong> руб.
                            </p>
                        </>
                    ) : (
                        <p>Нет данных</p>
                    )}
                    <button className="btn btn-secondary btn-sm mt-2" onClick={closeTooltip}>
                        Закрыть
                    </button>
                </div>
            )}
        </div>
    )
}

export default CalendarPage
