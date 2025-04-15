import React, { useEffect, useState } from 'react';
import CalendarHeader from './CalendarHeader.jsx';
import CalendarTable from './CalendarTable.jsx';
import useIsMobile from '../hooks/useIsMobile';

// ВНИМАНИЕ: если у вас есть какие-то особые константы или пропсы, правьте под себя.
function CalendarPage() {
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);

    const [weeks, setWeeks] = useState([]);
    const [allowedDays, setAllowedDays] = useState([]); // На всякий случай
    const [monthNames, setMonthNames] = useState({});
    const [attendedCount, setAttendedCount] = useState(0);
    const [totalCost, setTotalCost] = useState(0);

    // Состояния для всплывающего окна (tooltip) со сводкой по дню
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const [dailySummary, setDailySummary] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');

    // Локальные изменения статусов (key = record.id, value = true/false)
    const [pendingAttendance, setPendingAttendance] = useState({});

    // Проверяем, мобильное ли устройство
    const isMobile = useIsMobile();

    useEffect(() => {
        fetchCalendarData();
    }, [month, year]);

    // ----- Функции -----
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

    // Открытие tooltip с информацией о дне
    const openSummaryTooltip = async (event, date) => {
        event.stopPropagation();
        setSelectedDate(date);

        const rect = event.currentTarget.getBoundingClientRect();
        setTooltipPosition({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height + 5,
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

    // Закрыть tooltip
    const closeTooltip = () => {
        setTooltipVisible(false);
    };

    // Локально переключаем статус присутствия
    const toggleAttendanceLocally = (record) => {
        const recordId = record.id;
        const currentAttended = pendingAttendance.hasOwnProperty(recordId)
            ? pendingAttendance[recordId]
            : record.attended;

        setPendingAttendance((prev) => ({
            ...prev,
            [recordId]: !currentAttended,
        }));
    };

    // Сохранить все локальные изменения
    const saveChanges = async () => {
        try {
            const recordIds = Object.keys(pendingAttendance);
            if (recordIds.length === 0) return; // нет изменений

            for (const recordId of recordIds) {
                const shouldAttend = pendingAttendance[recordId];
                const formData = new FormData();
                formData.append('recordId', recordId);

                if (shouldAttend) {
                    // Ставим "присутствовал"
                    await fetch('/api/v1/calendar/check', {
                        method: 'POST',
                        body: formData,
                    });
                } else {
                    // Ставим "не присутствовал"
                    await fetch('/api/v1/calendar/uncheck', {
                        method: 'POST',
                        body: formData,
                    });
                }
            }

            // После сохранения очищаем локальные изменения
            setPendingAttendance({});
            // И перезапрашиваем данные
            await fetchCalendarData();
        } catch (error) {
            console.error('Ошибка при сохранении изменений:', error);
        }
    };

    // Удалить запись
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

    // Добавить новую запись (по имени)
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
        maxWidth: 'calc(100% - 20px)',
        margin: '0 10px',
    };

    // Фоновый слой для клика вне tooltip
    const backdropStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 900,
    };

    return (
        <div className="calendar-page" onClick={closeTooltip}>
            <CalendarHeader
                year={year}
                setYear={setYear}
                month={month}
                setMonth={setMonth}
                monthNames={monthNames}
                attendedCount={attendedCount}
                totalCost={totalCost}
                saveChanges={saveChanges}
            />

            {/* Рендер таблицы: 4 колонки (десктоп) или 2 колонки (мобильное) */}
            <CalendarTable
                weeks={weeks}
                pendingAttendance={pendingAttendance}
                toggleAttendanceLocally={toggleAttendanceLocally}
                deleteRecord={deleteRecord}
                addAttendance={addAttendance}
                openSummaryTooltip={openSummaryTooltip}
                mobileView={isMobile}
            />

            {/* Фон для закрытия tooltip при клике снаружи */}
            {tooltipVisible && <div style={backdropStyle} onClick={closeTooltip} />}

            {/* Сам tooltip со сводкой */}
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
    );
}

export default CalendarPage;
