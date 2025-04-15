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
    // Формируем выпадающий список месяцев
    const monthOptions = Object.entries(monthNames).map(([num, name]) => (
        <option key={num} value={num}>
            {name}
        </option>
    ));

    // Простая заглушка, чтобы форма не перезагружала страницу
    const handleMonthYearSubmit = (e) => e.preventDefault();

    return (
        <nav className="navbar navbar-dark bg-primary shadow-sm">
            <div className="container-fluid flex-column flex-sm-row align-items-start align-items-sm-center py-2 gap-2">
                <span className="navbar-brand fw-bold">Мои занятия</span>

                {/* Блок выбора месяца и года */}
                <form onSubmit={handleMonthYearSubmit} className="d-flex flex-wrap gap-2">
                    <div>
                        <label className="form-label mb-1 text-white-50">Месяц:</label>
                        <select
                            className="form-select form-select-sm"
                            value={month}
                            onChange={(e) => setMonth(Number(e.target.value))}
                        >
                            {monthOptions}
                        </select>
                    </div>

                    <div>
                        <label className="form-label mb-1 text-white-50">Год:</label>
                        <input
                            type="number"
                            className="form-control form-control-sm"
                            min="2020"
                            max="2100"
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                        />
                    </div>

                    <div className="align-self-end">
                        <button type="submit" className="btn btn-light btn-sm">
                            Показать
                        </button>
                    </div>
                </form>

                {/* Блок с суммарной информацией + кнопка "Сохранить" */}
                <div className="ms-sm-auto d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-3">
                    <div className="text-white-50 d-flex flex-column align-items-start align-items-sm-end">
                        <div>
                            Посещений: <strong className="text-white">{attendedCount}</strong>
                        </div>
                        <div>
                            Сумма: <strong className="text-white">{totalCost}</strong> руб.
                        </div>
                    </div>

                    <button type="button" className="btn btn-warning btn-sm" onClick={saveChanges}>
                        Сохранить
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default CalendarHeader;
