'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

// ── Project data ──
// Each project has a title (shown in the left list) and details shown in the right slide.
// Replace placeholders with your real project info and images.
interface Project {
  title: string;
  description: string;
  tech: string[];
  image: string;
  link?: string;
}

const projects: Project[] = [
  {
    title: 'Project One',
    description:
      'A full-stack web application built with the MERN stack featuring real-time data syncing and a responsive dashboard.',
    tech: ['React', 'Node.js', 'MongoDB', 'Express'],
    image: 'https://placehold.co/600x400/0e100f/3b82f6?text=Project+One',
    link: '#',
  },
  {
    title: 'Project Two',
    description:
      'A mobile-first e-commerce platform with payment integration, product filtering, and order tracking.',
    tech: ['Next.js', 'TypeScript', 'Tailwind', 'Stripe'],
    image: 'https://placehold.co/600x400/0e100f/0ae448?text=Project+Two',
    link: '#',
  },
  {
    title: 'Project Three',
    description:
      'An interactive data visualization tool that renders complex datasets into dynamic, explorable charts.',
    tech: ['D3.js', 'React', 'Python', 'FastAPI'],
    image: 'https://placehold.co/600x400/0e100f/9d95ff?text=Project+Three',
    link: '#',
  },
  {
    title: 'Project Four',
    description:
      'A real-time chat application with end-to-end encryption, group channels, and file sharing capabilities.',
    tech: ['Socket.io', 'React Native', 'Firebase'],
    image: 'https://placehold.co/600x400/0e100f/ff8709?text=Project+Four',
    link: '#',
  },
];

export default function Projects() {
  const pinRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const pinEl = pinRef.current;
      const list = listRef.current;
      const fill = fillRef.current;
      if (!pinEl || !list || !fill) return;

      const listItems = gsap.utils.toArray<HTMLElement>('.project-item', list);
      const slides = gsap.utils.toArray<HTMLElement>('.project-slide', pinEl);

      if (listItems.length === 0) return;

      // ── Set initial fill bar height (1/n of full height) ──
      gsap.set(fill, {
        scaleY: 1 / listItems.length,
        transformOrigin: 'top left',
      });

      // ── Main pinned timeline ──
      // This section is NOT a .panel, so it safely owns its own pin.
      // Pin the section and scrub through based on scroll.
      // Total scroll distance = number of items × 50% of viewport height.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pinEl,
          start: 'top top',
          end: '+=' + listItems.length * 50 + '%',
          pin: true,
          scrub: true,
        },
      });

      // ── Animate each list item + corresponding slide ──
      listItems.forEach((item, i) => {
        const previousItem = listItems[i - 1];

        if (previousItem) {
          // For items after the first: highlight current, dim previous
          tl.set(item, { color: '#3b82f6' }, 0.5 * i) // Highlight active item (blue)
            .to(
              slides[i],
              { autoAlpha: 1, duration: 0.2 }, // Fade in current slide
              '<'
            )
            .set(previousItem, { color: '#6b7280' }, '<') // Dim previous item (gray)
            .to(
              slides[i - 1],
              { autoAlpha: 0, duration: 0.2 }, // Fade out previous slide
              '<'
            );
        } else {
          // First item: set as active immediately (no animation needed)
          gsap.set(item, { color: '#3b82f6' });
          gsap.set(slides[i], { autoAlpha: 1 });
        }
      });

      // ── Fill bar grows from top to bottom over the entire timeline ──
      tl.to(
        fill,
        {
          scaleY: 1,
          transformOrigin: 'top left',
          ease: 'none',
          duration: tl.duration(),
        },
        0
      ).to({}, { duration: 0.1 }); // Small pause at the end before un-pinning
    },
    { scope: pinRef }
  );

  return (
    // Standalone section — NOT a .panel, so the page's panel system ignores it.
    // Uses its own pin: true in the ScrollTrigger above.
    // The "projects-section" class lets the navbar detect it for icon color.
    <section
      ref={pinRef}
      className="projects-section w-full h-screen flex items-center overflow-hidden rounded-[10px]"
      style={{ backgroundColor: 'var(--dark)', color: 'var(--light)' }}
    >
      <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row px-4 sm:px-8 lg:px-12 relative gap-8">
        {/* ── Left: Project list with progress indicator ── */}
        <div className="relative flex gap-4 shrink-0">
          {/* Vertical fill/progress bar */}
          <div className="relative w-[3px] self-stretch hidden md:block">
            {/* Track (background line) */}
            <div className="absolute inset-0 bg-white/10 rounded-full" />
            {/* Fill (animated progress) */}
            <div
              ref={fillRef}
              className="absolute top-0 left-0 w-full h-full bg-blue-500 rounded-full"
            />
          </div>

          {/* Project titles */}
          <ul ref={listRef} className="list-none p-0 m-0 flex flex-col gap-6 py-2">
            {projects.map((project, i) => (
              <li
                key={i}
                className="project-item text-xl sm:text-2xl md:text-3xl font-bold cursor-default transition-colors duration-300 text-gray-500"
                style={{ fontFamily: 'var(--font-achiko), cursive' }}
              >
                {project.title}
              </li>
            ))}
          </ul>
        </div>

        {/* ── Right: Project slides ── */}
        <div className="grow relative min-h-[350px] sm:min-h-[400px]">
          {projects.map((project, i) => (
            <div
              key={i}
              className="project-slide absolute inset-0 flex flex-col items-center justify-center gap-4 opacity-0 invisible"
            >
              {/* Project image */}
              <div className="w-full max-w-md overflow-hidden rounded-xl shadow-lg shadow-black/20">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
              </div>

              {/* Project info */}
              <div className="text-center max-w-md space-y-3">
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                  {project.description}
                </p>
                {/* Tech stack tags */}
                <div className="flex flex-wrap justify-center gap-2">
                  {project.tech.map((t) => (
                    <span
                      key={t}
                      className="px-3 py-1 text-xs font-medium rounded-full bg-white/10 text-blue-400 border border-white/10"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                {/* View project link */}
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors no-underline hover:no-underline"
                  >
                    View Project →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
