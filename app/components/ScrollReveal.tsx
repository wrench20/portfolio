import { useEffect, useRef, useMemo, ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  children: ReactNode;
  enableBlur?: boolean;
  baseOpacity?: number;
  baseRotation?: number;
  blurStrength?: number;
  containerClassName?: string;
  textClassName?: string;
  rotationEnd?: string;
  wordAnimationEnd?: string;
  enableHoverPop?: boolean;
}

export default function ScrollReveal({
  children,
  enableBlur = true,
  baseOpacity = 0.1,
  baseRotation = 3,
  blurStrength = 4,
  containerClassName = "",
  textClassName = "",
  rotationEnd = "bottom bottom",
  wordAnimationEnd = "bottom bottom",
  enableHoverPop = false
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLHeadingElement>(null);

  const splitText = useMemo(() => {
    const text = typeof children === "string" ? children : "";
    return text.split(/(\s+)/).map((word, i) => {
      if (word.match(/^\s+$/)) return word;

      // ✅ Apply hover pop class conditionally
      const hoverClass = enableHoverPop
        ? "transition-transform duration-300 hover:scale-110 hover:-translate-y-1"
        : "";

      return (
        <span className={`inline-block word ${hoverClass}`} key={i}>
          {word}
        </span>
      );
    });
  }, [children, enableHoverPop]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Store ScrollTrigger instances for proper cleanup
    const triggers: ScrollTrigger[] = [];

    // Rotation animation
    const rotationTrigger = gsap.fromTo(
      el,
      { transformOrigin: "0% 50%", rotate: baseRotation },
      {
        rotate: 0,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: rotationEnd,
          scrub: 1,
        },
      }
    );
    if (rotationTrigger.scrollTrigger) {
      triggers.push(rotationTrigger.scrollTrigger);
    }

    // Word reveal animation
    const wordElements = el.querySelectorAll<HTMLElement>(".word");
    const wordTrigger = gsap.fromTo(
      wordElements,
      {
        opacity: baseOpacity,
        filter: enableBlur ? `blur(${blurStrength}px)` : "none",
      },
      {
        opacity: 1,
        filter: "blur(0px)",
        ease: "none",
        stagger: 0.05,
        scrollTrigger: {
          trigger: el,
          start: "top bottom-=20%",
          end: wordAnimationEnd,
          scrub: 1,
        },
      }
    );
    if (wordTrigger.scrollTrigger) {
      triggers.push(wordTrigger.scrollTrigger);
    }

    // Cleanup: only kill ScrollTriggers created by this component
    return () => {
      triggers.forEach((trigger) => trigger.kill());
    };
  }, [enableBlur, baseRotation, baseOpacity, rotationEnd, wordAnimationEnd, blurStrength]);

  return (
    <span ref={containerRef} className={` ${containerClassName}`}>
      <p className={`leading-normal font-semibold ${textClassName}`}>
        {splitText}
      </p>
    </span>
  );
}
