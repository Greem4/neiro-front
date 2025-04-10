import React, { useEffect, useState } from 'react';
import { Check, X, Trash2 } from 'lucide-react';

const RUS_WEEKDAYS = ['Вт', 'Чт', 'Пт', 'Вс'];
const dayOrder = [2, 4, 5, 0];

function CalendarPage() {
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);

    const [weeks, setWeeks] = useState([]);
    const [allowedDays, setAllowedDays] = useState([]);
    const [monthNames, setMonthNames] = useState({});
    const [attendedCount, setAttendedCount] = useState(0);
    const [totalCost, setTotalCost] = useState(0);

    // Состояния для всплывающего окна (tooltip) со сводкой по дню
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const [dailySummary, setDailySummary] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');

    useEffect(() => {
        fetchCalendarData();
    }, [month, year]);

    const fetchCalendarData = async () => {
        try {
            const response = await fetch(`/api/v1/calendar?year=${year}&month=${month}`);
            if (!response.ok) throw new Error('Ошибка при получении данных календаря');
            const data = await response.json();
            setWeeks(data.weeks);
            setAllowedDays(data.allowedDays);
            setMonthNames(data.monthNames);
            setAttendedCount(data.attendedCount);
            setTotalCost(data.totalCost);
        } catch (error) {
            console.error('Ошибка:', error);
        }
    };

    // Функция получения сводки по выбранной дате и отображения tooltip
    const openSummaryTooltip = async (event, date) => {
        event.stopPropagation();
        setSelectedDate(date);
        // Получаем координаты клика и корректируем их для смещения tooltip
        const rect = event.target.getBoundingClientRect();
        setTooltipPosition({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height + 5, // с небольшим смещением вниз
        });
        const formattedDate = new Date(date).toISOString().split('T')[0];
        try {
            const response = await fetch(`/api/v1/calendar/daily-summary?start=${formattedDate}&end=${formattedDate}`);
            if (!response.ok) throw new Error('Ошибка при получении данных сводки');
            const data = await response.json();
            if (data && data.length > 0) {
                setDailySummary(data[0]);
            } else {
                setDailySummary({ attendedCount: 0, earnings: 0 });
            }
            setTooltipVisible(true);
        } catch (error) {
            console.error('Ошибка при получении сводки для даты', date, error);
        }
    };

    const closeTooltip = () => {
        setTooltipVisible(false);
    };

    const setAttended = async (recordId) => {
        try {
            const formData = new FormData();
            formData.append('recordId', recordId);
            await fetch('/api/v1/calendar/check', { method: 'POST', body: formData });
            await fetchCalendarData();
        } catch (error) {
            console.error('Ошибка:', error);
        }
    };

    const setNotAttended = async (recordId) => {
        try {
            const formData = new FormData();
            formData.append('recordId', recordId);
            await fetch('/api/v1/calendar/uncheck', { method: 'POST', body: formData });
            await fetchCalendarData();
        } catch (error) {
            console.error('Ошибка:', error);
        }
    };

    const deleteRecord = async (recordId) => {
        try {
            const response = await fetch(`/api/v1/calendar/delete?recordId=${recordId}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Ошибка при удалении записи');
            await fetchCalendarData();
        } catch (error) {
            console.error('Ошибка:', error);
        }
    };

    const addAttendance = async (event, date) => {
        event.preventDefault();
        const form = event.target;
        const personName = form.personName.value.trim();
        if (!personName) return;

        try {
            const formData = new FormData();
            formData.append('personName', personName);
            formData.append('date', date);

            const response = await fetch('/api/v1/calendar/add', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Ошибка при добавлении записи');
            form.reset();
            await fetchCalendarData();
        } catch (error) {
            console.error('Ошибка:', error);
        }
    };

    const handleMonthYearSubmit = (e) => e.preventDefault();

    const monthOptions = Object.entries(monthNames).map(([num, name]) => (
        <option key={num} value={num}>
            {name}
        </option>
    ));

    // Стили для tooltip (всплывающее окно)
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
    };

    // Фоновый полупрозрачный слой, который закрывает tooltip при клике вне него
    const backdropStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 900,
    };

    return (
        <div className="container-fluid px-0" onClick={closeTooltip}>
            <div className="py-3">
                <h1 className="text-center mb-3">Календарь занятий</h1>

                <form onSubmit={handleMonthYearSubmit} className="d-flex flex-wrap gap-2 justify-content-center mb-3">
                    <div>
                        <label className="form-label mb-1">Месяц:</label>
                        <select className="form-select" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                            {monthOptions}
                        </select>
                    </div>

                    <div>
                        <label className="form-label mb-1">Год:</label>
                        <input
                            type="number"
                            className="form-control"
                            min="2020"
                            max="2100"
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                        />
                    </div>

                    <div className="align-self-end">
                        <button type="submit" className="btn btn-primary">
                            Показать
                        </button>
                    </div>
                </form>

                <div className="text-center mb-2">
          <span className="fs-5">
            Текущий выбор: <strong>{month}/{year}</strong>
          </span>
                </div>

                <div className="table-responsive px-2">
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
                            const dayMap = {};
                            week.forEach((cell) => {
                                const jsDay = new Date(cell.date).getDay();
                                dayMap[jsDay] = cell;
                            });
                            return (
                                <tr key={weekIndex}>
                                    {dayOrder.map((dow) => {
                                        const cell = dayMap[dow];
                                        if (!cell || !cell.inCurrentMonth) {
                                            return <td key={dow} />;
                                        }
                                        const tdClass = cell.inCurrentMonth ? '' : 'bg-light';

                                        return (
                                            <td key={dow} className={tdClass} style={{ minWidth: '120px', verticalAlign: 'top' }}>
                                                <div className="d-flex flex-column p-1" style={{ minHeight: '150px' }}>
                                                    {/* При клике на номер дня запускаем функцию с event для получения координат */}
                                                    <div
                                                        className="fw-bold mb-2"
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={(e) => openSummaryTooltip(e, cell.date)}
                                                    >
                                                        {new Date(cell.date).getDate()}
                                                    </div>
                                                    <ul className="list-unstyled flex-grow-1">
                                                        {cell.records.map((record) => (
                                                            <li key={record.id} className="mb-2">
                                                                <div className="d-flex align-items-center justify-content-between">
                                    <span className={record.attended ? 'fw-bold text-success' : ''}>
                                      {record.personName}
                                    </span>
                                                                    <div className="d-flex gap-1">
                                                                        {record.attended ? (
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-sm btn-outline-success"
                                                                                onClick={() => setNotAttended(record.id)}
                                                                                title="Отметить как не был"
                                                                            >
                                                                                <Check size={16} />
                                                                            </button>
                                                                        ) : (
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-sm btn-outline-danger"
                                                                                onClick={() => setAttended(record.id)}
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
                                                        ))}
                                                    </ul>
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
                                        );
                                    })}
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>

                <hr className="mx-2" />

                <div className="text-center">
                    <p className="fs-5 mb-1">
                        Отмечено посещений: <strong>{attendedCount}</strong>
                    </p>
                    <p className="fs-5">
                        Итоговая сумма: <strong>{totalCost}</strong> руб.
                    </p>
                </div>
            </div>

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
                                Пришли: <strong>{dailySummary.attendedCount}</strong> из <strong>{dailySummary.totalCount}</strong>
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
    );
}

export default CalendarPage;
