'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  useGSAP(() => {
    tl.current = gsap
      .timeline({ paused: true })
      .to(menuRef.current, {
        clipPath: 'circle(150% at calc(100% - 2.5rem) 2.5rem)',
        duration: 0.6,
        ease: 'power3.inOut',
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

  return (
    <header className="header" style={{ zIndex: 9998 }}>
      <a href="/" className="logo" aria-label="Home">
        <span className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-grand-hotel), cursive' }}>
          TN
        </span>
      </a>

      <button
        onClick={toggle}
        className="relative z-[9999] flex flex-col justify-center items-center w-10 h-10 gap-1.5"
        aria-label="Toggle menu"
        aria-expanded={open}
      >
        <span
          className={`block h-0.5 w-6 bg-white transition-all duration-300 ${open ? 'rotate-45 translate-y-2' : ''}`}
        />
        <span
          className={`block h-0.5 w-6 bg-white transition-all duration-300 ${open ? 'opacity-0' : ''}`}
        />
        <span
          className={`block h-0.5 w-6 bg-white transition-all duration-300 ${open ? '-rotate-45 -translate-y-2' : ''}`}
        />
      </button>

      <div
        ref={menuRef}
        className="fixed inset-0 bg-[var(--dark,#0e100f)] flex flex-col items-center justify-center gap-8"
        style={{ clipPath: 'circle(0% at calc(100% - 2.5rem) 2.5rem)' }}
      >
        <nav>
          <ul className="flex flex-col items-center gap-6">
            {['Home', 'About', 'Projects', 'Contact'].map((item) => (
              <li key={item}>
                <a
                  href={`#${item.toLowerCase()}`}
                  className="menu-link text-4xl font-bold text-white hover:text-blue-400 transition-colors duration-300"
                  style={{ fontFamily: 'var(--font-grand-hotel), cursive' }}
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
