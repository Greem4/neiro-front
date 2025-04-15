import React from 'react';

function CalendarHeader({
                            year,
                            setYear,
                            month,
                            setMonth,
                            monthNames,
                            attendedCount,
                            totalCost,
                            saveChanges
                        }) {
    // Формируем список месяцев
    const monthOptions = Object.entries(monthNames).map(([num, name]) => (
        <option key={num} value={num}>
            {name}
        </option>
    ));

    // Заглушка, чтобы форма выбора месяца/года не сабмитилась при Enter
    const handleMonthYearSubmit = (e) => e.preventDefault();

    return (
        <nav className="navbar navbar-dark bg-primary">
            {/* .container-fluid, чтобы фон navbar тянулся на всю ширину */}
            <div className="container-fluid py-2 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                    {/* Название/заголовок */}
                    <span className="navbar-brand fw-bold mb-0">Мои занятия</span>

                    {/* Форма выбора месяца и года + кнопка «Показать» + «Сохранить» */}
                    <form onSubmit={handleMonthYearSubmit} className="d-flex align-items-center gap-2 mb-0">
                        <label className="text-white-50 mb-0">Месяц:</label>
                        <select
                            className="form-select form-select-sm"
                            value={month}
                            onChange={(e) => setMonth(Number(e.target.value))}
                        >
                            {monthOptions}
                        </select>

                        <label className="text-white-50 mb-0">Год:</label>
                        <input
                            type="number"
                            className="form-control form-control-sm"
                            min="2020"
                            max="2100"
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                        />

                        <button type="submit" className="btn btn-light btn-sm">
                            Показать
                        </button>

                        {/* Кнопка «Сохранить» */}
                        <button
                            type="button"
                            className="btn btn-success btn-sm"
                            onClick={saveChanges}
                        >
                            Сохранить
                        </button>
                    </form>
                </div>

                {/* Блок со статистикой (справа) */}
                <div className="text-white-50 text-end">
                    <div>
                        Посещений: <strong className="text-white">{attendedCount}</strong>
                    </div>
                    <div>
                        Сумма: <strong className="text-white">{totalCost}</strong> руб.
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default CalendarHeader;
