import React from 'react';
import { Save } from 'lucide-react';
import '../styles/calendar-header.scss';

function CalendarHeader({
                            year,
                            setYear,
                            month,
                            setMonth,
                            monthNames,
                            attendedCount,
                            totalCost,
                            saveChanges,
                        }) {
    const monthOptions = Object.entries(monthNames).map(([num, name]) => (
        <option key={num} value={num}>
            {name}
        </option>
    ));

    return (
        <header className="calendar-header">
            <div className="calendar-header__inner">
                {/* Логотип */}
                <span className="calendar-header__brand">Мои&nbsp;занятия</span>

                {/* Сжатая форма выбора */}
                <form
                    onSubmit={(e) => e.preventDefault()}
                    className="calendar-header__form mb-0"
                >
                    <select
                        className="form-select form-select-sm"
                        value={month}
                        onChange={(e) => setMonth(+e.target.value)}
                    >
                        {monthOptions}
                    </select>

                    <input
                        type="number"
                        className="form-control form-control-sm"
                        min="2020"
                        max="2100"
                        value={year}
                        onChange={(e) => setYear(+e.target.value)}
                    />
                </form>

                {/* Кнопка + статистика */}
                <div className="d-flex align-items-center gap-3">
                    <button
                        type="button"
                        className="btn btn-icon btn-save btn-sm"
                        onClick={saveChanges}
                        title="Сохранить изменения"
                    >
                        <Save size={16} />
                        <span className="d-none d-sm-inline">Сохранить</span>
                    </button>

                    <div className="calendar-header__stats text-end">
                        <div>
                            Посещений:&nbsp;<strong>{attendedCount}</strong>
                        </div>
                        <div>
                            Сумма:&nbsp;<strong>{totalCost}</strong>&nbsp;руб.
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default CalendarHeader;
