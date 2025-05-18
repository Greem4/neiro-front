/* -------------------------------------------------------------------------
 * КОМПОНЕНТ:  SaveFooter
 * ОТВЕЧАЕТ ЗА: «плавающую» панель-подсказку, которая появляется внизу
 *              страницы, когда есть несохранённые изменения.
 * ---------------------------------------------------------------------- */
import React from 'react';
import PropTypes from 'prop-types';

function SaveFooter({ pendingCount, onSave, onCancel }) {
    return (
        <div className="save-footer card-shadow">
            <span className="me-auto">
                Сохранить:&nbsp;<strong>{pendingCount}</strong>
            </span>

            <button
                type="button"
                className="btn btn-sm btn-success me-2"
                onClick={onSave}
            >
                Сохранить
            </button>

            <button
                type="button"
                className="btn btn-sm btn-outline-light text-dark"
                onClick={onCancel}
            >
                Отменить
            </button>
        </div>
    );
}

SaveFooter.propTypes = {
    pendingCount: PropTypes.number.isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

export default SaveFooter;
