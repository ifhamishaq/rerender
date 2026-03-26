import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Delay scroll to sync with the TransitionWipe curtain closure
        const timeout = setTimeout(() => {
            if (window.lenis) {
                window.lenis.scrollTo(0, { immediate: true });
            } else {
                window.scrollTo({
                    top: 0,
                    behavior: 'instant'
                });
            }
        }, 300); // 300ms is the sweet spot for the curtain to cover the screen

        return () => clearTimeout(timeout);
    }, [pathname]);

    return null;
};

export default ScrollToTop;
