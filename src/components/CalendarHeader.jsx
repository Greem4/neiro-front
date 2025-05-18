
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
                            totalCostWithoutTax,
                            totalCostWithTax,
                            saveChanges,
                        }) {
    /* формируем список <option> по ключам объекта monthNames */
    const monthOptions = Object.entries(monthNames).map(([num, name]) => (
        <option key={num} value={num}>
            {name}
        </option>
    ));

    return (
        <header className="calendar-header">
            <div className="calendar-header__inner">
                {/* -------------------- ЛОГО/БРЕНД -------------------- */}
                <span className="calendar-header__brand">Мои&nbsp;занятия</span>

                {/* ---------------- ОСНОВНАЯ «СТРОКА» -----------------
                 * На десктопе — ровно одна строка.
                 * На мобайле — превращается в две колонки
                 *   при помощи flex-правил в SCSS.               */}
                <div className="calendar-header__row">
                    {/* ---- Блок выбора месяца / года ---- */}
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

                    {/* ---- Кнопка «Сохранить» + статистика ---- */}
                    <div className="calendar-header__actions">
                        <div className="calendar-header__stats text-end">
                            <div>
                                Посещений:&nbsp;<strong>{attendedCount}</strong>
                            </div>
                            <div>
                                Сумма:&nbsp;<strong>{totalCostWithoutTax}</strong>&nbsp;руб.
                            </div>
                            <div>
                                Сумма c учетом налога:&nbsp;<strong>{totalCostWithTax}</strong>&nbsp;руб.
                            </div>
                            <button
                                type="button"
                                className="btn btn-icon btn-save btn-sm"
                                onClick={saveChanges}
                                title="Сохранить изменения"
                            >
                                <Save size={16} />
                                <span>Сохранить</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default CalendarHeader;
