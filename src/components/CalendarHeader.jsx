// src/components/CalendarHeader.jsx
import React from 'react';
import { Save } from 'lucide-react';
import LogoutButton from '../auth/LogoutButton.jsx';
import '../styles/calendar-header.scss';

function CalendarHeader({
                            year, setYear,
                            month, setMonth,
                            monthNames,
                            attendedCount,
                            totalCostWithoutTax,
                            totalCostWithTax,
                            potentialProfit,
                            totalCost,
                            saveChanges,
                            onLogout,          // <- добавьте проп для обработки логаута
                        }) {
    const monthOptions = Object.entries(monthNames).map(([num, name]) => (
        <option key={num} value={num}>{name}</option>
    ));

    return (
        <header className="calendar-header">
            <div className="calendar-header__inner">

                {/* ───────── первый ряд: бренд слева, кнопка Выйти справа ───────── */}
                <div className="calendar-header__brand-area">
                    <span className="calendar-header__brand">Мои занятия</span>
                    <button
                        type="button"
                        className="calendar-header__logout"
                        onClick={onLogout}
                        title="Выйти"
                    >
                        <LogoutButton />
                    </button>
                </div>

                {/* ───────── выбор месяца / года ───────── */}
                <form
                    className="calendar-header__form"
                    onSubmit={e => e.preventDefault()}
                >
                    <select
                        className="form-select form-select-sm"
                        value={month}
                        onChange={e => setMonth(+e.target.value)}
                    >
                        {monthOptions}
                    </select>
                    <input
                        type="number"
                        className="form-control form-control-sm"
                        min="2020"
                        max="2100"
                        value={year}
                        onChange={e => setYear(+e.target.value)}
                    />
                </form>

                {/* ───────── статистика + кнопка «Сохранить» ───────── */}
                <div className="calendar-header__actions">
                    <div className="stats-grid">
                        <div className="stat-item">
                            <div className="stat-item__label">Посещений</div>
                            <div className="stat-item__value">{attendedCount}</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-item__label">
                                Заработано<br/><small>(без налога)</small>
                            </div>
                            <div className="stat-item__value">{totalCostWithoutTax} ₽</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-item__label">ЗП – налог</div>
                            <div className="stat-item__value">{totalCostWithTax} ₽</div>
                        </div>
                        <div className="stat-item stat-item--highlight">
                            <div className="stat-item__label">Будущие занятия</div>
                            <div className="stat-item__value">{potentialProfit} ₽</div>
                        </div>
                        <div className="stat-item stat-item--full">
                            <div className="stat-item__label">Ожидаем в конце месяца:</div>
                            <div className="stat-item__value">{totalCost} ₽</div>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="btn btn-icon btn-save btn-lg"
                        onClick={saveChanges}
                        title="Сохранить изменения"
                    >
                        <Save size={18} />
                        <span>Сохранить</span>
                    </button>
                </div>
            </div>
        </header>
    );
}

export default CalendarHeader;
