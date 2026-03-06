'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';
import GridPattern from './components/gridPattern';
gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, SplitText);

export default function Layers() {
  const main = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const panels = gsap.utils.toArray<HTMLElement>('.panel');
      const allButLast = panels.slice(0, -1);

      allButLast.forEach((panel) => {
        const innerpanel = panel.querySelector('.section-inner') as HTMLElement;
        if (!innerpanel) return;

        const panelHeight = innerpanel.offsetHeight;
        const windowHeight = window.innerHeight;
        const difference = panelHeight - windowHeight;

        const fakeScrollRatio =
          difference > 0 ? difference / (difference + windowHeight) : 0;

        if (fakeScrollRatio) {
          panel.style.marginBottom = panelHeight * fakeScrollRatio + 'px';
        }

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: panel,
            start: 'bottom bottom',
            end: () =>
              fakeScrollRatio
                ? `+=${innerpanel.offsetHeight}`
                : 'bottom top',
            pinSpacing: false,
            pin: true,
            scrub: true,
          },
        });

        if (fakeScrollRatio) {
          tl.to(innerpanel, {
            yPercent: -100,
            y: windowHeight,
            duration: 1 / (1 - fakeScrollRatio) - 1,
            ease: 'none',
          });
        }

        tl.fromTo(
          panel,
          { scale: 1, opacity: 1 },
          { scale: 0.7, opacity: 0.5, duration: 0.9 }
        ).to(panel, { opacity: 0, duration: 0.1 });
      });

      gsap.to('#motion-rect', {
        motionPath: {
          path: '#orbit-path',
          align: '#orbit-path',
          alignOrigin: [0.5, 0.5],
        },
        duration: 20,
        ease: 'none',
        repeat: -1,
      });

      panels.forEach((panel, i) => {
        const targets = panel.querySelectorAll('.split-text');
        targets.forEach((el) => {
          const split = SplitText.create(el, { type: 'chars,words' });

          gsap.set(split.chars, {
            y: 60,
            opacity: 0,
            rotateX: -90,
            transformOrigin: '50% 50% -30px',
          });

          if (i === 0) {
            gsap.to(split.chars, {
              y: 0,
              opacity: 1,
              rotateX: 0,
              duration: 0.8,
              stagger: 0.04,
              ease: 'back.out(1.7)',
              delay: 0.3,
            });
          } else {
            ScrollTrigger.create({
              trigger: panel,
              start: 'top 60%',
              onEnter: () => {
                gsap.to(split.chars, {
                  y: 0,
                  opacity: 1,
                  rotateX: 0,
                  duration: 0.8,
                  stagger: 0.04,
                  ease: 'back.out(1.7)',
                });
              },
            });
          }
        });
      });
    },
    { scope: main }
  );

  return (
    <main ref={main}>
      <section className="description panel dark relative">
        <GridPattern />
        <div className="section-content">
          <div className="section-inner">
            <div className="flex items-center sm:p-12 sm:py-0 sm:pb-0 p-0 py-2 pb-2 ">
              <div className="w-full h-full  mx-auto pt-8 lg:mt-28 sm:pt-12 relative flex justify-start">
                <div className="flex justify-center flex-col gap-8 lg:grid lg:grid-cols-3  items-center place-items-center ">
                  <div className="flex justify-center col-span-1 items-center sm:p-12 sm:py-0 sm:pb-0 p-0 py-2 pb-2">
                    <div
                      className="relative group"
                    >
                      <svg
                        className="absolute -inset-8 w-[calc(100%+4rem)] h-[calc(100%+4rem)] z-30 pointer-events-none"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="-4 -4 110 110"
                        fill="none"
                        overflow="visible"
                      >
                        <defs>
                          <linearGradient id="orbit-grad" x1="-4" y1="-4" x2="9" y2="9" gradientUnits="userSpaceOnUse">
                            <stop offset="0.2" stopColor="#2B7FFF" />
                            <stop offset="0.5" stopColor="#2B7FFF" />
                          </linearGradient>
                        </defs>
                        <path
                          id="orbit-path"
                          stroke="rgba(250,225,225,0.15)"
                          strokeWidth="0.5"
                          d="M51,1 A50,50 0 1,0 51,101 A50,50 0 1,0 51,1Z"
                        />
                        <rect
                          id="motion-rect"
                          fill="url(#orbit-grad)"
                          width="3"
                          height="3"
                          x="-1.5"
                          y="-1.5"
                          rx="2"
                        />
                      </svg>

                      <div className="absolute -inset-6 opacity-[25%] z-0 block">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-400 rounded-full blur-2xl animate-spin-slower" />
                        <div className="absolute inset-0 bg-gradient-to-l from-sky-400 via-cyan-400 to-teal-300 rounded-full blur-2xl animate-pulse-slow opacity-50" />
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-800 via-sky-500 to-teal-200 rounded-full blur-2xl animate-float opacity-50" />
                      </div>

                      <div className="relative">
                        <div className="w-64 h-64 sm:w-64 sm:h-64 xl:w-77 xl:h-77 2xl:w-[24.3rem] 2xl:h-[24.3rem] rounded-full overflow-hidden shadow-[0_0_40px_rgba(120,119,198,0.3)] transform transition-all duration-700 group-hover:scale-105">
                          <div className="absolute inset-0 border-4 border-white/20 rounded-full z-20 transition-all duration-700 group-hover:border-white/40 group-hover:scale-105" />

                          {/* Optimized overlay effects - disabled on mobile */}
                          <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 via-transparent to-blue-500/20 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 block" />

                          <img
                            src="/3.jpeg"
                            alt="Profile"
                            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-2"
                            loading="lazy"
                            width={1000}
                            height={1000}
                          />
                          {/* 
                      Advanced hover effects - desktop only */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700 z-20 hidden sm:block">
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-white/10 to-transparent transform translate-y-full group-hover:-translate-y-full transition-transform duration-1000 delay-100" />
                            <div className="absolute inset-0 rounded-full border-8 border-white/10 scale-0 group-hover:scale-100 transition-transform duration-700 animate-pulse-slow" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4 col-span-2 text-center lg:text-left">
                    <div

                      className="space-y-2"
                    >
                      <p className=" text-3xl text-white sm:text-3xl md:text-3xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold tracking-tight flex justify-center space-x-4 lg:justify-start">
                        Hi there, I&apos;m
                      </p>
                      <span className="split-text title relative text-blue-500 text-7xl sm:text-7xl md:text-7xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-bold tracking-tight flex justify-center space-x-4 lg:justify-start bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text">
                        Tebi Njeik
                      </span>
                    </div>


                    <p

                      className="text-base sm:text-lg lg:text-xl text-gray-400  md:w-3/5 pb-4 sm:pb-0 lg:text-start"
                    >
                      A <span>full stack developer</span> with a passion for creating seamless user experiences and building scalable applications.
                    </p>

                    {/* <ul className="flex justify-center md:justify-start mt-5 space-x-5">
                    <li>
                      <a
                        href="https://www.linkedin.com/in/tebi-njeik"
                        className="text-gray-500 group hover:text-blue-600 animate-bounce-slow relative"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          id="meteor-icon-kit__solid-linkedin"
                          className="relative z-10 transition-all h-10 w-10 duration-300 fill-white"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                          <g
                            id="SVGRepo_tracerCarrier"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          ></g>
                          <g id="SVGRepo_iconCarrier">
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M22.2857 0H1.70893C0.766071 0 0 0.776786 0 1.73036V22.2696C0 23.2232 0.766071 24 1.70893 24H22.2857C23.2286 24 24 23.2232 24 22.2696V1.73036C24 0.776786 23.2286 0 22.2857 0ZM7.25357 20.5714H3.69643V9.11786H7.25893V20.5714H7.25357ZM5.475 7.55357C4.33393 7.55357 3.4125 6.62679 3.4125 5.49107C3.4125 4.35536 4.33393 3.42857 5.475 3.42857C6.61071 3.42857 7.5375 4.35536 7.5375 5.49107C7.5375 6.63214 6.61607 7.55357 5.475 7.55357ZM20.5875 20.5714H17.0304V15C17.0304 13.6714 17.0036 11.9625 15.1821 11.9625C13.3286 11.9625 13.0446 13.4089 13.0446 14.9036V20.5714H9.4875V9.11786H12.9V10.6821H12.9482C13.425 9.78214 14.5875 8.83393 16.3179 8.83393C19.9179 8.83393 20.5875 11.2071 20.5875 14.2929V20.5714Z"
                              className="w-10 h-10"
                              fill="currentColor"
                            ></path>
                          </g>
                        </svg>
                        <div className="absolute top-full left-0 w-full h-full rounded-md bg-white hidden group-hover:block  z-0 transition-all duration-500 group-hover:top-0"></div>
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://github.com/Wrench200"
                        className="text-gray-500 hover:text-black  group animate-bounce-slow relative"
                      >
                        <svg
                          className=" relative z-10 transition-all h-10 w-10 duration-300"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                        <div className="absolute top-full left-0 w-full h-full rounded-full bg-white hidden group-hover:block  z-0 transition-all duration-500 group-hover:top-0"></div>
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.instagram.com/njeik_20/"
                        className="text-gray-500 hover:text-white animate-bounce-slow relative group"
                      >
                        <svg
                          className="relative z-10 transition-all h-10 w-10 duration-300"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                        <div className="absolute top-full left-0 w-full h-full rounded-lg bg-gradient-to-bl from-purple-500 via-pink-500 to-yellow-500  hidden group-hover:block  z-0 transition-all duration-500 group-hover:top-0"></div>
                      </a>
                    </li>
                  </ul> */}
                  </div>
                </div>
              </div>
            </div>
            <div className="scroll-down">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </section>
      <section className="panel dark">
        <div className="section-content">
          <div className="section-inner">
            <h1 className="split-text">ONE</h1>
           
          </div>
        </div>
      </section>
      <section className="panel purple">
        <div className="section-content">
          <div className="section-inner">
            <h1 className="split-text">TWO</h1>
          </div>
        </div>
      </section>
      <section className="panel orange">
        <div className="section-content">
          <div className="section-inner">
            <h1 className="split-text">THREE</h1>
          </div>
        </div>
      </section>
      <section className="panel red">
        <div className="section-content">
          <div className="section-inner">
            <h1 className="split-text">FOUR</h1>
          </div>
        </div>
      </section>
      <section className="panel green">
        <div className="section-content">
          <div className="section-inner">
            <h1 className="split-text">FIVE</h1>
          </div>
        </div>
      </section>
    </main>
  );
}
