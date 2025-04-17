import React, { useEffect, useState } from 'react';
import CalendarHeader from './CalendarHeader.jsx';
import CalendarTable from './CalendarTable.jsx';
import useIsMobile from '../hooks/useIsMobile';
import '../styles/calendar-page.scss';

function CalendarPage() {
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);

    const [weeks, setWeeks] = useState([]);
    const [allowedDays, setAllowedDays] = useState([]);
    const [monthNames, setMonthNames] = useState({});
    const [attendedCount, setAttendedCount] = useState(0);
    const [totalCost, setTotalCost] = useState(0);

    // Tooltip
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const [dailySummary, setDailySummary] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');

    // Локальные изменения
    const [pendingAttendance, setPendingAttendance] = useState({});

    const isMobile = useIsMobile();

    useEffect(() => {
        fetchCalendarData();
    }, [year, month]);

    const fetchCalendarData = async () => {
        try {
            const response = await fetch(
                `/api/v1/calendar?year=${year}&month=${month}`
            );
            if (!response.ok) throw new Error('Ошибка получения календаря');
            const data = await response.json();
            setWeeks(data.weeks);
            setAllowedDays(data.allowedDays);
            setMonthNames(data.monthNames);
            setAttendedCount(data.attendedCount);
            setTotalCost(data.totalCost);
        } catch (err) {
            console.error('fetchCalendarData:', err);
        }
    };

    const openSummaryTooltip = async (e, date) => {
        e.stopPropagation();
        setSelectedDate(date);
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltipPosition({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height + 8,
        });

        try {
            const formatted = new Date(date).toISOString().split('T')[0];
            const resp = await fetch(
                `/api/v1/calendar/daily-summary?start=${formatted}&end=${formatted}`
            );
            if (!resp.ok) throw new Error('Ошибка получения сводки');
            const [summary] = await resp.json();
            setDailySummary(
                summary || { totalCount: 0, attendedCount: 0, earnings: 0 }
            );
            setTooltipVisible(true);
        } catch (err) {
            console.error('openSummaryTooltip:', err);
        }
    };

    const closeTooltip = () => setTooltipVisible(false);

    const toggleAttendanceLocally = (record) => {
        const { id, attended } = record;
        const current = pendingAttendance.hasOwnProperty(id)
            ? pendingAttendance[id]
            : attended;
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

                await fetch(
                    shouldAttend
                        ? '/api/v1/calendar/check'
                        : '/api/v1/calendar/uncheck',
                    { method: 'POST', body: formData }
                );
            }

            setPendingAttendance({});
            await fetchCalendarData();
        } catch (err) {
            console.error('saveChanges:', err);
        }
    };

    const deleteRecord = async (recordId) => {
        try {
            const resp = await fetch(
                `/api/v1/calendar/delete?recordId=${recordId}`,
                { method: 'DELETE' }
            );
            if (!resp.ok) throw new Error('Ошибка удаления');
            await fetchCalendarData();
        } catch (err) {
            console.error('deleteRecord:', err);
        }
    };

    const addAttendance = async (e, date) => {
        e.preventDefault();
        const name = e.target.personName.value.trim();
        if (!name) return;

        const formData = new FormData();
        formData.append('personName', name);
        formData.append('date', date);

        try {
            const resp = await fetch('/api/v1/calendar/add', {
                method: 'POST',
                body: formData,
            });
            if (!resp.ok) throw new Error('Ошибка добавления записи');
            e.target.reset();
            await fetchCalendarData();
        } catch (err) {
            console.error('addAttendance:', err);
        }
    };

    // стили тултипа
    const tooltipStyle = {
        position: 'fixed',
        top: tooltipPosition.y,
        left: tooltipPosition.x,
        transform: 'translate(-50%, 0)',
        background: '#fff',
        border: '1px solid #ddd',
        borderRadius: '0.75rem',
        padding: '0.75rem 1rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        zIndex: 1050,
        minWidth: 180,
        maxWidth: 'calc(100% - 2rem)',
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

            {tooltipVisible && (
                <>
                    <div
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'transparent',
                            zIndex: 1040,
                        }}
                        onClick={closeTooltip}
                    />
                    <div style={tooltipStyle} onClick={(e) => e.stopPropagation()}>
                        <h6 className="fw-bold mb-2">
                            Сводка&nbsp;
                            {new Date(selectedDate).toLocaleDateString('ru-RU')}
                        </h6>
                        <p className="mb-1">
                            Записей:&nbsp;
                            <strong>{dailySummary?.totalCount ?? 0}</strong>
                        </p>
                        <p className="mb-1">
                            Пришли:&nbsp;
                            <strong>{dailySummary?.attendedCount ?? 0}</strong>
                        </p>
                        <p className="mb-2">
                            Заработано:&nbsp;
                            <strong>{dailySummary?.earnings ?? 0}</strong>&nbsp;руб.
                        </p>
                        <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={closeTooltip}
                        >
                            Закрыть
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default CalendarPage;
