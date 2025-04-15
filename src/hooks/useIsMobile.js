import { useState, useEffect } from 'react';

/**
 * Возвращает true, если ширина экрана < 576px (Bootstrap breakpoint 'sm').
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
