import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import './PillNav.css';

const PillNav = ({
  logo,
  logoAlt = 'Logo',
  items,
  activeHref,
  className = '',
  ease = 'power3.easeOut',
  baseColor = '#fff',
  pillColor = '#E8111A', // Using RE-RENDER red as default pill color
  hoveredPillTextColor = '#fff',
  pillTextColor,
  onMobileMenuClick,
  initialLoadAnimation = true
}) => {
  const resolvedPillTextColor = pillTextColor ?? baseColor;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const circleRefs = useRef([]);
  const tlRefs = useRef([]);
  const activeTweenRefs = useRef([]);
  const logoImgRef = useRef(null);
  const logoTweenRef = useRef(null);
  const hamburgerRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navItemsRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle, index) => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        
        // Calculate circle radius and position for smooth expansion
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`
        });

        const label = pill.querySelector('.pill-label');
        const white = pill.querySelector('.pill-label-hover');

        if (label) gsap.set(label, { y: 0 });
        if (white) gsap.set(white, { y: h + 12, opacity: 0 });

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });

        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 0.6, ease, overwrite: 'auto' }, 0);

        if (label) {
          tl.to(label, { y: -(h + 8), duration: 0.5, ease, overwrite: 'auto' }, 0);
        }

        if (white) {
          gsap.set(white, { y: Math.ceil(h + 20), opacity: 0 });
          tl.to(white, { y: 0, opacity: 1, duration: 0.5, ease, overwrite: 'auto' }, 0);
        }

        tlRefs.current[index] = tl;
      });
    };

    layout();

    const onResize = () => layout();
    window.addEventListener('resize', onResize);

    // Initial animations
    if (initialLoadAnimation) {
      const logo = logoRef.current;
      const navItems = navItemsRef.current;

      if (logo) {
        gsap.from(logo, { scale: 0, opacity: 0, duration: 0.8, ease });
      }

      if (navItems) {
        const pills = navItems.querySelectorAll('.pill');
        gsap.from(pills, { 
            opacity: 0, 
            y: 10, 
            stagger: 0.05, 
            duration: 0.8, 
            ease,
            delay: 0.2
        });
      }
    }

    return () => window.removeEventListener('resize', onResize);
  }, [items, ease, initialLoadAnimation]);

  const handleEnter = (i) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.play();
  };

  const handleLeave = (i) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.reverse();
  };

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);

    const menu = mobileMenuRef.current;
    if (menu) {
      if (newState) {
        gsap.set(menu, { display: 'flex', opacity: 0, y: 10 });
        gsap.to(menu, { opacity: 1, y: 0, duration: 0.3, ease });
      } else {
        gsap.to(menu, { opacity: 0, y: 10, duration: 0.2, ease, onComplete: () => {
            gsap.set(menu, { display: 'none' });
        }});
      }
    }

    onMobileMenuClick?.();
  };

  const isRouterLink = (href) => href && !href.startsWith('http') && !href.startsWith('#');

  const cssVars = {
    '--base': baseColor,
    '--pill-bg': pillColor,
    '--hover-text': hoveredPillTextColor,
    '--pill-text': resolvedPillTextColor
  };

  return (
    <div className="pill-nav-container" style={cssVars}>
      <nav className={`pill-nav ${className}`} aria-label="Primary">
        
        {/* LOGO AREA */}
        <div className="pill-logo-section">
            <Link to="/" className="pill-logo" ref={logoRef}>
                {logo ? (
                    <img src={logo} alt={logoAlt} ref={logoImgRef} />
                ) : (
                    <span style={{ fontWeight: 900, color: 'var(--base)', fontSize: '14px', letterSpacing: '-0.05em' }}>RE-RENDER</span>
                )}
            </Link>
        </div>

        {/* DESKTOP NAV ITEMS */}
        <div className="pill-nav-items desktop-only" ref={navItemsRef}>
          <ul className="pill-list">
            {items.map((item, i) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={`pill${activeHref === item.href ? ' is-active' : ''}`}
                  onMouseEnter={() => handleEnter(i)}
                  onMouseLeave={() => handleLeave(i)}
                >
                  <span
                    className="hover-circle"
                    ref={el => {
                      circleRefs.current[i] = el;
                    }}
                  />
                  <span className="label-stack">
                    <span className="pill-label">{item.label}</span>
                    <span className="pill-label-hover">
                      {item.label}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* MOBILE HAMBURGER */}
        <button
          className="mobile-menu-button mobile-only"
          onClick={toggleMobileMenu}
        >
          <div className={`hamburger-icon ${isMobileMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
          </div>
        </button>
      </nav>

      {/* MOBILE MENU POPOVER */}
      <div className="mobile-menu-popover mobile-only" ref={mobileMenuRef}>
        <ul className="mobile-menu-list">
          {items.map(item => (
            <li key={item.href}>
              <Link
                to={item.href}
                className={`mobile-menu-link${activeHref === item.href ? ' is-active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PillNav;
