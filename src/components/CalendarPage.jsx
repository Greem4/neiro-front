import React, { useEffect, useState } from 'react';
import CalendarHeader from './CalendarHeader.jsx';
import CalendarTable from './CalendarTable.jsx';
import useIsMobile from '../hooks/useIsMobile';

function CalendarPage() {
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);

    const [weeks, setWeeks] = useState([]);
    const [allowedDays, setAllowedDays] = useState([]);
    const [monthNames, setMonthNames] = useState({});
    const [attendedCount, setAttendedCount] = useState(0);
    const [totalCost, setTotalCost] = useState(0);

    // Tooltip для деталей дня
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const [dailySummary, setDailySummary] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');

    // Локальные изменения статусов записей
    const [pendingAttendance, setPendingAttendance] = useState({});

    // Определяем, мобильное ли устройство
    const isMobile = useIsMobile();

    useEffect(() => {
        fetchCalendarData();
    }, [year, month]);

    const fetchCalendarData = async () => {
        try {
            const response = await fetch(`/api/v1/calendar?year=${year}&month=${month}`);
            if (!response.ok) throw new Error('Ошибка получения календаря');
            const data = await response.json();
            setWeeks(data.weeks);
            setAllowedDays(data.allowedDays);
            setMonthNames(data.monthNames);
            setAttendedCount(data.attendedCount);
            setTotalCost(data.totalCost);
        } catch (error) {
            console.error('fetchCalendarData:', error);
        }
    };

    const openSummaryTooltip = async (event, date) => {
        event.stopPropagation();
        setSelectedDate(date);
        const rect = event.currentTarget.getBoundingClientRect();
        setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height + 5 });
        try {
            const formatted = new Date(date).toISOString().split('T')[0];
            const resp = await fetch(`/api/v1/calendar/daily-summary?start=${formatted}&end=${formatted}`);
            if (!resp.ok) throw new Error('Ошибка получения сводки');
            const [summary] = await resp.json();
            setDailySummary(summary || { totalCount: 0, attendedCount: 0, earnings: 0 });
            setTooltipVisible(true);
        } catch (err) {
            console.error('openSummaryTooltip:', err);
        }
    };

    const closeTooltip = () => setTooltipVisible(false);

    const toggleAttendanceLocally = (record) => {
        const { id, attended } = record;
        const current = pendingAttendance.hasOwnProperty(id) ? pendingAttendance[id] : attended;
        setPendingAttendance((prev) => ({ ...prev, [id]: !current }));
    };

    const saveChanges = async () => {
        try {
            const changes = Object.keys(pendingAttendance);
            if (changes.length === 0) return;
            for (const recordId of changes) {
                const shouldAttend = pendingAttendance[recordId];
                const formData = new FormData();
                formData.append('recordId', recordId);
                if (shouldAttend) {
                    await fetch('/api/v1/calendar/check', { method: 'POST', body: formData });
                } else {
                    await fetch('/api/v1/calendar/uncheck', { method: 'POST', body: formData });
                }
            }
            setPendingAttendance({});
            await fetchCalendarData();
        } catch (error) {
            console.error('saveChanges:', error);
        }
    };

    const deleteRecord = async (recordId) => {
        try {
            const resp = await fetch(`/api/v1/calendar/delete?recordId=${recordId}`, { method: 'DELETE' });
            if (!resp.ok) throw new Error('Ошибка удаления');
            await fetchCalendarData();
        } catch (err) {
            console.error('deleteRecord:', err);
        }
    };

    const addAttendance = async (e, date) => {
        e.preventDefault();
        const form = e.target;
        const personName = form.personName.value.trim();
        if (!personName) return;
        try {
            const formData = new FormData();
            formData.append('personName', personName);
            formData.append('date', date);
            const resp = await fetch('/api/v1/calendar/add', { method: 'POST', body: formData });
            if (!resp.ok) throw new Error('Ошибка добавления записи');
            form.reset();
            await fetchCalendarData();
        } catch (err) {
            console.error('addAttendance:', err);
        }
    };

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
        margin: '0 10px'
    };

    const backdropStyle = {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 900
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

            <CalendarTable
                weeks={weeks}
                pendingAttendance={pendingAttendance}
                toggleAttendanceLocally={toggleAttendanceLocally}
                deleteRecord={deleteRecord}
                addAttendance={addAttendance}
                openSummaryTooltip={openSummaryTooltip}
                mobileView={isMobile}
            />

            {tooltipVisible && <div style={backdropStyle} onClick={closeTooltip} />}

            {tooltipVisible && (
                <div style={tooltipStyle} onClick={(e) => e.stopPropagation()}>
                    <h5 style={{ marginBottom: '8px' }}>
                        Сводка за {new Date(selectedDate).toLocaleDateString()}
                    </h5>
                    {dailySummary ? (
                        <>
                            <p style={{ margin: '4px 0' }}>
                                Записей: <strong>{dailySummary.totalCount || 0}</strong>
                            </p>
                            <p style={{ margin: '4px 0' }}>
                                Пришли: <strong>{dailySummary.attendedCount || 0}</strong>
                            </p>
                            <p style={{ margin: '4px 0' }}>
                                Заработано: <strong>{dailySummary.earnings || 0}</strong> руб.
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
