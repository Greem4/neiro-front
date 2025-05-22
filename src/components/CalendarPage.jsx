// src/components/CalendarPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { api }          from '@/api/client';
import { useAuth }      from '@/auth/AuthContext.jsx';
import { useNavigate }  from 'react-router-dom';

import CalendarHeader from './CalendarHeader.jsx';
import CalendarTable  from './CalendarTable.jsx';
import SaveFooter     from './SaveFooter.jsx';
import useIsMobile    from '../hooks/useIsMobile';
import '../styles/calendar-page.scss';

export default function CalendarPage() {
    /* ————————————————————————————————————————
     *   Хранилище токена / logout
     * ———————————————————————————————————————— */
    const { logout } = useAuth();
    const navigate   = useNavigate();
    const onLogout   = () => { logout(); navigate('/login'); };

    /* ————————————————————————————————————————
     *        Стейт календаря / UI
     * ———————————————————————————————————————— */
    const now   = new Date();
    const [year,  setYear ] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);

    const [weeks,               setWeeks]               = useState([]);
    const [monthNames,          setMonthNames]          = useState({});
    const [attendedCount,       setAttendedCount]       = useState(0);
    const [totalCostWithoutTax, setTotalCostWithoutTax] = useState(0);
    const [totalCostWithTax,    setTotalCostWithTax]    = useState(0);
    const [potentialProfit,     setPotentialProfit]     = useState(0);
    const [totalCost,           setTotalCost]           = useState(0);

    const [pendingAttendance,   setPendingAttendance]   = useState({});
    const [toast,               setToast]               = useState({ visible:false, message:'' });

    /* ——— для всплывающей «сводки» ——— */
    const [tooltipVisible,  setTooltipVisible]  = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({x:0, y:0});
    const [dailySummary,    setDailySummary]    = useState(null);
    const [selectedDate,    setSelectedDate]    = useState('');

    const isMobile = useIsMobile();

    /* ──────────────────────────────────────────
     *            Загрузка календаря
     * ────────────────────────────────────────── */
    const fetchCalendarData = useCallback(async () => {
        const data = await api(`/api/v1/calendar?year=${year}&month=${month}`);
        setWeeks               (data.weeks);
        setMonthNames          (data.monthNames);
        setAttendedCount       (data.attendedCount);
        setTotalCostWithoutTax (data.totalCostWithoutTax);
        setTotalCostWithTax    (data.totalCostWithTax);
        setPotentialProfit     (data.potentialProfit);
        setTotalCost           (data.totalCost);
    }, [year, month]);

    useEffect(() => { fetchCalendarData(); }, [fetchCalendarData]);

    /* ──────────────────────────────────────────
     *       Всплывающая «Сводка за день»
     * ────────────────────────────────────────── */
    const openSummaryTooltip = async (e, date) => {
        e.stopPropagation();
        setSelectedDate(date);

        const r = e.currentTarget.getBoundingClientRect();
        setTooltipPosition({ x: r.left + r.width/2, y: r.top + r.height + 8 });

        const iso = new Date(date).toISOString().split('T')[0];
        const [summary] = await api(
            `/api/v1/calendar/daily-summary?start=${iso}&end=${iso}`,
        );
        setDailySummary(summary ?? { totalCount:0, attendedCount:0, earnings:0 });
        setTooltipVisible(true);
    };
    const closeTooltip = () => setTooltipVisible(false);

    /* ──────────────────────────────────────────
     *      Локально переключаем «был/не был»
     * ────────────────────────────────────────── */
    const toggleAttendanceLocally = (record) => {
        setPendingAttendance(prev => ({
            ...prev,
            [record.id]: !(prev.hasOwnProperty(record.id)
                ? prev[record.id]
                : record.attended),
        }));
    };

    /* ──────────────────────────────────────────
     *                PATCH / SAVE
     * ────────────────────────────────────────── */
    const saveChanges = async () => {
        const ids = Object.keys(pendingAttendance);
        if (!ids.length) return;

        const beforeCnt  = attendedCount;
        const beforeCost = totalCostWithTax;

        await Promise.all(ids.map(id =>
            api(`/api/v1/calendar/${id}`, {
                method: 'PATCH',
                body:   { attended: pendingAttendance[id] },
            }),
        ));

        setPendingAttendance({});
        const data = await api(`/api/v1/calendar?year=${year}&month=${month}`);

        setWeeks               (data.weeks);
        setMonthNames          (data.monthNames);
        setAttendedCount       (data.attendedCount);
        setTotalCostWithoutTax (data.totalCostWithoutTax);
        setTotalCostWithTax    (data.totalCostWithTax);
        setPotentialProfit     (data.potentialProfit);
        setTotalCost           (data.totalCost);

        setToast({
            visible : true,
            message : `Сохранено: ${data.attendedCount-beforeCnt} чел. / ${data.totalCostWithTax-beforeCost} ₽`,
        });
        setTimeout(() => setToast({visible:false,message:''}), 4000);
    };

    const cancelChanges = () => setPendingAttendance({});

    /* ──────────────────────────────────────────
     *                 DELETE
     * ────────────────────────────────────────── */
    const deleteRecord = async (id) => {
        await api(`/api/v1/calendar/${id}`, { method:'DELETE' });
        await fetchCalendarData();
    };

    /* ──────────────────────────────────────────
     *                 POST /add
     * ────────────────────────────────────────── */
    const addAttendance = async (e, date) => {
        e.preventDefault();
        const name = e.target.personName.value.trim();
        if (!name) return;

        const fd = new FormData();
        fd.append('personName', name);
        fd.append('startDate',  date);

        await api('/api/v1/calendar/add', { method:'POST', body:fd });
        e.target.reset();
        await fetchCalendarData();
    };

    /* ──────────────────────────────────────────
     *                    UI
     * ────────────────────────────────────────── */
    const tooltipStyle = {
        position:'fixed', top:tooltipPosition.y, left:tooltipPosition.x,
        transform:'translate(-50%,0)',
        background:'#fff', border:'1px solid #ddd', borderRadius:'0.75rem',
        padding:'0.75rem 1rem', boxShadow:'0 4px 12px rgba(0,0,0,.1)',
        zIndex:1050, minWidth:180, maxWidth:'calc(100% - 2rem)',
    };

    return (
        <div className="calendar-page" onClick={closeTooltip}>
            <CalendarHeader
                year={year}  setYear={setYear}
                month={month} setMonth={setMonth}
                monthNames={monthNames}
                attendedCount={attendedCount}
                totalCostWithoutTax={totalCostWithoutTax}
                totalCostWithTax={totalCostWithTax}
                potentialProfit={potentialProfit}
                totalCost={totalCost}
                saveChanges={saveChanges}
                onLogout={onLogout}
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

            {Object.keys(pendingAttendance).length > 0 && (
                <SaveFooter
                    pendingCount={Object.keys(pendingAttendance).length}
                    onSave={saveChanges}
                    onCancel={cancelChanges}
                />
            )}

            {toast.visible && (
                <div className="toast-info card-shadow">{toast.message}</div>
            )}

            {tooltipVisible && (
                <>
                    <div
                        style={{ position:'fixed', inset:0, background:'transparent', zIndex:1040 }}
                        onClick={closeTooltip}
                    />
                    <div style={tooltipStyle} onClick={e => e.stopPropagation()}>
                        <h6 className="fw-bold mb-2">
                            Сводка&nbsp;{new Date(selectedDate).toLocaleDateString('ru-RU')}
                        </h6>
                        <p className="mb-1">Записей: <strong>{dailySummary?.totalCount}</strong></p>
                        <p className="mb-1">Пришли: <strong>{dailySummary?.attendedCount}</strong></p>
                        <p className="mb-2">Заработано: <strong>{dailySummary?.earnings}</strong>&nbsp;руб.</p>
                        <button className="btn btn-outline-secondary btn-sm" onClick={closeTooltip}>
                            Закрыть
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
