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
    // Генерируем options для списка месяцев
    const monthOptions = Object.entries(monthNames).map(([num, name]) => (
        <option key={num} value={num}>
            {name}
        </option>
    ));

    // Предотвращаем сабмит формы (чтобы не перезагружался сайт)
    const handleMonthYearSubmit = (e) => e.preventDefault();

    return (
        <nav className="navbar navbar-dark bg-primary">
            {/* В десктопе оборачиваем в контейнер для аккуратности */}
            <div className="desktop-container py-3 d-flex flex-wrap align-items-center justify-content-between gap-3">
                {/* Левая часть: логотип/название */}
                <div className="d-flex align-items-center">
                    <span className="navbar-brand fw-bold mb-0">Мои занятия</span>
                </div>

                {/* Центральная часть: форма выбора месяца, года и кнопка "Показать" */}
                <form
                    onSubmit={handleMonthYearSubmit}
                    className="d-flex align-items-center gap-2 mb-0"
                >
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
                </form>

                {/* Правая часть: кнопка "Сохранить" и статистика */}
                <div className="d-flex align-items-center gap-3">
                    <button
                        type="button"
                        className="btn btn-success btn-sm"
                        onClick={saveChanges}
                    >
                        Сохранить
                    </button>
                    <div className="text-white-50 text-end">
                        <div>
                            Посещений: <strong className="text-white">{attendedCount}</strong>
                        </div>
                        <div>
                            Сумма: <strong className="text-white">{totalCost}</strong> руб.
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default CalendarHeader;
