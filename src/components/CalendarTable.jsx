import React from 'react';
import { Check, X, Trash2 } from 'lucide-react';
import '../styles/calendar-table.scss';

// DOW: вторник, четверг, пятница, воскресенье
const RUS_WEEKDAYS = ['Вт', 'Чт', 'Пт', 'Вс'];
const dayOrder = [2, 4, 5, 0];
const mobilePairs = [
    [dayOrder[0], dayOrder[1]],
    [dayOrder[2], dayOrder[3]],
];

function CalendarTable({
                           weeks,
                           pendingAttendance,
                           toggleAttendanceLocally,
                           deleteRecord,
                           addAttendance,
                           openSummaryTooltip,
                           mobileView,
                       }) {
    const renderDayCell = (cell) => {
        if (!cell || !cell.inCurrentMonth)
            return <td style={{ minWidth: '120px' }} />;

        return (
            <td key={cell.date}>
                <div className="day-cell">
                    {/* номер дня */}
                    <div
                        className="day-number mb-1"
                        onClick={(e) => openSummaryTooltip(e, cell.date)}
                    >
                        {new Date(cell.date).getDate()}
                    </div>

                    {/* записи */}
                    <ul className="records">
                        {cell.records.map((record) => {
                            const localAttended = pendingAttendance.hasOwnProperty(record.id)
                                ? pendingAttendance[record.id]
                                : record.attended;

                            return (
                                <li key={record.id}>
                  <span
                      className={
                          localAttended ? 'name--attended' : undefined
                      }
                  >
                    {record.personName}
                  </span>

                                    <div className="btn-group btn-group-sm">
                                        <button
                                            type="button"
                                            className={`btn btn-outline-${
                                                localAttended ? 'success' : 'danger'
                                            }`}
                                            onClick={() => toggleAttendanceLocally(record)}
                                            title={
                                                localAttended
                                                    ? 'Отметить как не был'
                                                    : 'Отметить как был'
                                            }
                                        >
                                            {localAttended ? <Check size={16} /> : <X size={16} />}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={() => deleteRecord(record.id)}
                                            title="Удалить запись"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>

                    {/* форма добавления */}
                    <form
                        className="add-record mt-auto"
                        onSubmit={(e) => addAttendance(e, cell.date)}
                    >
                        <input
                            type="text"
                            name="personName"
                            className="form-control form-control-sm"
                            placeholder="Имя"
                            required
                        />
                        <button
                            type="submit"
                            className="btn btn-outline-primary btn-sm"
                            title="Добавить"
                        >
                            +
                        </button>
                    </form>
                </div>
            </td>
        );
    };

    // 4‑колоночный десктоп
    const renderDesktop = () => (
        <div className="table-responsive calendar-table my-3">
            <table className="table table-bordered align-middle text-center">
                <thead className="table-light">
                <tr>{RUS_WEEKDAYS.map((d) => <th key={d}>{d}</th>)}</tr>
                </thead>
                <tbody>
                {weeks.map((week, idx) => {
                    const dayMap = {};
                    week.forEach((cell) => {
                        dayMap[new Date(cell.date).getDay()] = cell;
                    });

                    return (
                        <tr key={idx}>
                            {dayOrder.map((d) => renderDayCell(dayMap[d]))}
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );

    // 2‑колоночный мобайл
    const renderMobile = () => (
        <div className="table-responsive calendar-table my-3">
            <table className="table table-bordered align-middle text-center">
                <thead className="table-light">
                <tr>
                    <th>{RUS_WEEKDAYS[0]}</th>
                    <th>{RUS_WEEKDAYS[1]}</th>
                </tr>
                </thead>
                <tbody>
                {weeks.flatMap((week, idx) => {
                    const dayMap = {};
                    week.forEach((cell) => {
                        dayMap[new Date(cell.date).getDay()] = cell;
                    });

                    return mobilePairs.map((pair, pIdx) => (
                        <tr key={`${idx}-${pIdx}`}>
                            {pair.map((d) => renderDayCell(dayMap[d]))}
                        </tr>
                    ));
                })}
                </tbody>
            </table>
        </div>
    );

    return mobileView ? renderMobile() : renderDesktop();
}

export default CalendarTable;
