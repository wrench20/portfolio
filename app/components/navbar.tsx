'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [iconColor, setIconColor] = useState('#ffffff'); // Default white for dark panels
  const menuRef = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const rafId = useRef<number>(0);
  const lastColor = useRef('#ffffff'); // Avoid unnecessary re-renders

  // Determine which panel sits behind the navbar and update icon color.
  // Runs on every scroll frame via rAF for pixel-perfect accuracy in both directions.
  const checkPanelColor = useCallback(() => {
    // Query both .panel elements AND the standalone .projects-section
    const panels = document.querySelectorAll('.panel, .projects-section');
    if (panels.length === 0) return;

    // Sample point: center-x of viewport, 60px from top (roughly where navbar icons sit)
    const probeY = 60;
    let activePanel: HTMLElement | null = null;

    // Walk panels bottom-to-top so the topmost (latest-painted) panel wins
    for (let i = panels.length - 1; i >= 0; i--) {
      const rect = (panels[i] as HTMLElement).getBoundingClientRect();
      // Panel covers the probe point if its top is above probeY and bottom is below it
      if (rect.top <= probeY && rect.bottom > probeY) {
        activePanel = panels[i] as HTMLElement;
        break;
      }
    }

    if (!activePanel) return;

    const newColor = activePanel.classList.contains('light') ? '#0e100f' : '#ffffff';
    if (newColor !== lastColor.current) {
      lastColor.current = newColor;
      setIconColor(newColor);
    }
  }, []);

  useEffect(() => {
    let mutationObserver: MutationObserver | null = null;
    let listening = false;

    function onScroll() {
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(checkPanelColor);
    }

    function startListening() {
      if (listening) return;
      const panels = document.querySelectorAll('.panel, .projects-section');
      if (panels.length === 0) return false;

      listening = true;
      window.addEventListener('scroll', onScroll, { passive: true });
      checkPanelColor(); // Set initial color
      return true;
    }

    // Try immediately — panels may already exist
    if (!startListening()) {
      // Panels not yet in DOM; watch for them
      mutationObserver = new MutationObserver(() => {
        if (startListening()) {
          mutationObserver?.disconnect();
        }
      });
      mutationObserver.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId.current);
      mutationObserver?.disconnect();
    };
  }, [checkPanelColor]);

  // Disable scrolling when menu is open
  useEffect(() => {
    if (open) {
      // Store the current scroll position
      const scrollY = window.scrollY;
      
      // Disable scrolling by setting overflow hidden on body and html
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      // Also set on html for better browser compatibility
      document.documentElement.style.overflow = 'hidden';
      
      // Store scroll position in a data attribute for restoration
      document.body.setAttribute('data-scroll-y', scrollY.toString());
    } else {
      // Get stored scroll position
      const scrollY = document.body.getAttribute('data-scroll-y');
      
      // Re-enable scrolling
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.documentElement.style.overflow = '';
      
      // Restore scroll position
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY, 10));
      }
      
      // Clean up data attribute
      document.body.removeAttribute('data-scroll-y');
    }
  }, [open]);

  useGSAP(() => {
    tl.current = gsap
      .timeline({ paused: true })
      .to(menuRef.current, {
        clipPath: 'circle(150% at calc(100% - 2.5rem) 2.5rem)',
        duration: 0.6,
        ease: 'power3.inOut',
        backgroundColor: '#ffff',
      })
      .fromTo(
        '.menu-link',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.08, duration: 0.4, ease: 'back.out(1.7)' },
        '-=0.3'
      );
  });

  function toggle() {
    setOpen((prev) => {
      const next = !prev;
      if (next) tl.current?.play();
      else tl.current?.reverse();
      return next;
    });
  }

  // When menu is open, force icons to stay white; otherwise use dynamic color
  const displayIconColor = open ? '#ffffff' : iconColor;

  return (
    <header className="fixed flex justify-center inset-x-0 top-0 md:h-40 h-24 z-[9998] ">
      <div className="mx-auto  w-11/12 flex  justify-between items-center md:h-full h-auto ">
        <a href="/" aria-label="Home" className="md:w-16 md:h-16 w-12 h-12 flex items-center justify-center z-[9999]">
          <svg xmlns="http://www.w3.org/2000/svg"   viewBox="-10 -1 27.22 19.19">
            <path d="M-10-1-5.592 5.452-3.635 2.217-.519 2.297-3.995 8.608-1.957 12.003 3.675 2.337 7.15 2.257 9.067 5.452 12-1-10-1ZM15-1 17.216 2.181 8.947 18.195 5.352 12.003 1.638 18.195-.24 14.999 5.352 5.492 9 11 15-1Z" fill={displayIconColor} style={{ transition: 'fill 0.3s ease-in-out' }} />
          </svg>
        </a>

        <label className="flex flex-col hover:scale-110 transition-all duration-300  justify-center items-center gap-2 w-10 cursor-pointer relative z-[9999]" aria-label="Toggle menu">
          <input
            className="peer hidden"
            type="checkbox"
            checked={open}
            onChange={toggle}
          />
          <div 
            className="h-[6px] w-full duration-500 peer-checked:rotate-45 transform peer-checked:translate-y-[7.2px] origin-center transition-colors ease-in-out" 
            style={{ backgroundColor: displayIconColor }}
          />
          <div 
            className="h-[6px] w-full duration-500 peer-checked:-rotate-45 transform peer-checked:-translate-y-[7.2px] origin-center transition-colors ease-in-out" 
            style={{ backgroundColor: displayIconColor }}
          />
        </label>
      </div>

      <div
        ref={menuRef}
        className="fixed inset-0 flex flex-col items-center justify-center gap-8 bg-blend-multiply bg-black!"
        style={{ clipPath: 'circle(0% at calc(100% - 2.5rem) 2.5rem)', backgroundColor: '#0000' }}
      >
        <nav>
          <ul className="flex flex-col items-center gap-6">
            {['Home', 'About', 'Projects', 'Contact'].map((item) => (
              <li key={item}>
                <a
                  href={`#${item.toLowerCase()}`}
                  className="menu-link text-8xl font-bold text-white hover:text-blue-400 transition-colors duration-300"
                  style={{ fontFamily: 'var(--font-achiko), cursive' }}
                  onClick={toggle}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
