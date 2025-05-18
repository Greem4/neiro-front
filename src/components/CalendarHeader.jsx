import React from 'react';
import {Save} from 'lucide-react';
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
                            potentialProfit,
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
                {/* Логотип / бренд */}
                <span className="calendar-header__brand">Мои занятия</span>

                {/* Форма выбора месяца и года */}
                <form
                    onSubmit={(e) => e.preventDefault()}
                    className="calendar-header__form"
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

                {/* Блок статистики + кнопка */}
                <div className="calendar-header__actions">
                    <div className="stats-grid">
                        {/* Плитка 1 */}
                        <div className="stat-item">
                            <div className="stat-item__label">Посещений</div>
                            <div className="stat-item__value">{attendedCount}</div>
                        </div>
                        {/* Плитка 2 */}
                        <div className="stat-item">
                            <div className="stat-item__label">
                                Заработано<br/><small>(без налога)</small>
                            </div>
                            <div className="stat-item__value">
                                {totalCostWithoutTax} ₽
                            </div>
                        </div>
                        {/* Плитка 3 */}
                        <div className="stat-item">
                            <div className="stat-item__label">ЗП с налогом</div>
                            <div className="stat-item__value">
                                {totalCostWithTax} ₽
                            </div>
                        </div>
                        {/* Плитка 4 (выделенная) */}
                        <div className="stat-item stat-item--highlight">
                            <div className="stat-item__label">
                                Будущие занятия
                            </div>
                            <div className="stat-item__value">
                                {potentialProfit} ₽
                            </div>
                        </div>
                        <div className="stat-item stat-item--full">
                            <div className="stat-item__label">Ожидаем в конце месяца :</div>
                            <div className="stat-item__value">{totalCost} ₽</div>
                        </div>
                    </div>

                    {/* Кнопка «Сохранить» */}
                    <button
                        type="button"
                        className="btn btn-icon btn-save btn-lg"
                        onClick={saveChanges}
                        title="Сохранить изменения"
                    >
                        <Save size={18}/>
                        <span>Сохранить</span>
                    </button>
                </div>
            </div>
        </header>
    );
}

export default CalendarHeader;
