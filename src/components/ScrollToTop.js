import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component that automatically scrolls to top when route changes
 * Place this component inside Router but outside Routes
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top instantly whenever the pathname changes
    // Using instant scroll to avoid conflicts with smooth scrolling
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default ScrollToTop;