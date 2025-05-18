import { useState, useEffect } from 'react';

/**
 * Возвращает true, если текущая ширина экрана соответствует медиазапросу CSS
 * @media (max-width: 576px)
 */
export default function useIsMobile() {
    // Инициализируем состояние, опираясь на matchMedia
    const [isMobile, setIsMobile] = useState(() =>
        window.matchMedia('(max-width: 576px)').matches
    );

    useEffect(() => {
        const mediaQuery = window.matchMedia('(max-width: 576px)');

        // Обработчик изменений
        const handler = (event) => {
            setIsMobile(event.matches);
        };

        // Подписываемся
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handler);
        } else {
            // для старых браузеров
            mediaQuery.addListener(handler);
        }

        // На случай, если ширина изменилась ещё до подписки
        setIsMobile(mediaQuery.matches);

        // Убираем подписку при размонтировании
        return () => {
            if (mediaQuery.removeEventListener) {
                mediaQuery.removeEventListener('change', handler);
            } else {
                mediaQuery.removeListener(handler);
            }
        };
    }, []);

    return isMobile;
}
