import { useState, useEffect } from 'react';

/** Возвращает true, если ширина экрана < 576px. */
export default function useIsMobile() {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 576);

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 576);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    return isMobile;
}
