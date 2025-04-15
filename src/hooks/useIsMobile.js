import { useState, useEffect } from 'react';

/**
 * Хук для определения, является ли устройство "мобильным"
 * (например, ширина экрана меньше 576px).
 */
export default function useIsMobile() {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 576);

    useEffect(() => {
        function handleResize() {
            setIsMobile(window.innerWidth < 576);
        }
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return isMobile;
}
