import React from 'react';
import { Check, X, Trash2 } from 'lucide-react';

// Русские будни и соответствующие дни недели
const RUS_WEEKDAYS = ['Вт', 'Чт', 'Пт', 'Вс'];
// Числовые коды (JS): вторник=2, четверг=4, пятница=5, воскресенье=0
const dayOrder = [2, 4, 5, 0];

// Для мобильного режима — пары (2 колонки)
const mobilePairs = [
    [dayOrder[0], dayOrder[1]], // [2,4]
    [dayOrder[2], dayOrder[3]]  // [5,0]
];

function CalendarTable({
                           weeks,
                           pendingAttendance,
                           toggleAttendanceLocally,
                           deleteRecord,
                           addAttendance,
                           openSummaryTooltip,
                           mobileView
                       }) {
    // Рендер ячейки дня
    const renderDayCell = (cell) => {
        if (!cell || !cell.inCurrentMonth) {
            // Пустая ячейка (вне текущего месяца)
            return <td style={{ minWidth: '120px' }} />;
        }

        return (
            <td key={cell.date} style={{ minWidth: '120px', verticalAlign: 'top' }}>
                <div className="d-flex flex-column p-1" style={{ minHeight: '150px' }}>
                    {/* Номер дня, кликаем для открытия tooltip */}
                    <div
                        className="fw-bold mb-2"
                        style={{ cursor: 'pointer' }}
                        onClick={(e) => openSummaryTooltip(e, cell.date)}
                    >
                        {new Date(cell.date).getDate()}
                    </div>

                    {/* Список записей */}
                    <ul className="list-unstyled flex-grow-1">
                        {cell.records.map((record) => {
                            // Проверяем локальное изменение статуса
                            const localAttended = pendingAttendance.hasOwnProperty(record.id)
                                ? pendingAttendance[record.id]
                                : record.attended;

                            return (
                                <li key={record.id} className="mb-2">
                                    <div className="d-flex align-items-center justify-content-between">
                    <span className={localAttended ? 'fw-bold text-success' : ''}>
                      {record.personName}
                    </span>
                                        <div className="d-flex gap-1">
                                            {/* Кнопка переключения статуса */}
                                            {localAttended ? (
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-success"
                                                    onClick={() => toggleAttendanceLocally(record)}
                                                    title="Отметить как не был"
                                                >
                                                    <Check size={16} />
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => toggleAttendanceLocally(record)}
                                                    title="Отметить как был"
                                                >
                                                    <X size={16} />
                                                </button>
                                            )}

                                            {/* Кнопка удаления */}
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-secondary"
                                                onClick={() => deleteRecord(record.id)}
                                                title="Удалить запись"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>

                    {/* Форма добавления новой записи */}
                    <form onSubmit={(e) => addAttendance(e, cell.date)} className="mt-auto d-flex">
                        <input
                            type="text"
                            name="personName"
                            className="form-control form-control-sm me-1"
                            placeholder="Имя"
                            required
                        />
                        <button type="submit" className="btn btn-sm btn-outline-primary">
                            +
                        </button>
                    </form>
                </div>
            </td>
        );
    };

    // 4-колоночная таблица (десктоп)
    const renderDesktopTable = () => (
        <div className="table-responsive">
            <table className="table table-bordered align-middle text-center mb-3">
                <thead className="table-secondary">
                <tr>
                    {RUS_WEEKDAYS.map((day) => (
                        <th key={day}>{day}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {weeks.map((week, weekIndex) => {
                    const dayMap = {};
                    week.forEach((cell) => {
                        const jsDay = new Date(cell.date).getDay();
                        dayMap[jsDay] = cell;
                    });
                    return (
                        <tr key={weekIndex}>
                            {dayOrder.map((dow) => renderDayCell(dayMap[dow]))}
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );

    // 2-колоночная таблица (мобильная)
    const renderMobileTable = () => (
        <div className="table-responsive">
            <table className="table table-bordered align-middle text-center mb-3">
                <thead className="table-secondary">
                <tr>
                    <th>{RUS_WEEKDAYS[0]}</th>
                    <th>{RUS_WEEKDAYS[1]}</th>
                </tr>
                </thead>
                <tbody>
                {weeks.map((week, weekIndex) => {
                    const dayMap = {};
                    week.forEach((cell) => {
                        const jsDay = new Date(cell.date).getDay();
                        dayMap[jsDay] = cell;
                    });
                    // Разбиваем каждую неделю на 2 строки (2 дня в строке)
                    return mobilePairs.map((pair, pairIndex) => (
                        <tr key={`${weekIndex}-${pairIndex}`}>
                            {pair.map((dow) => renderDayCell(dayMap[dow]))}
                        </tr>
                    ));
                })}
                </tbody>
            </table>
        </div>
    );

    return mobileView ? renderMobileTable() : renderDesktopTable();
}

export default CalendarTable;
