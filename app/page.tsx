'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';
import GridPattern from './components/gridPattern';
import About from './components/about';
import Projects from './components/projects';
import { FadeIn } from './components/FadeIn';

// Register GSAP plugins for use throughout the component
// - ScrollTrigger: Enables scroll-based animations
// - MotionPathPlugin: Allows elements to follow SVG paths
// - MorphSVGPlugin: Enables smooth morphing between SVG shapes
// - SplitText: Splits text into individual characters/words for animation
gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, MorphSVGPlugin, SplitText);

export default function Layers() {
  const main = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      // ============================================
      // SECTION 1: PANEL PINNING & SCROLL ANIMATIONS
      // ============================================
      // This section creates a "scroll-jacking" effect where panels are pinned
      // to the viewport and their inner content scrolls vertically while the
      // panel itself scales down and fades out as you scroll.

      // Get all panel elements and exclude the last one (no pinning needed for final panel)
      const panels = gsap.utils.toArray<HTMLElement>('.panel');
      const allButLast = panels.slice(0, -1);

      allButLast.forEach((panel) => {
        const innerpanel = panel.querySelector('.section-inner') as HTMLElement;
        if (!innerpanel) return;

        // Calculate dimensions to determine if panel content is taller than viewport
        const panelHeight = innerpanel.offsetHeight;
        const windowHeight = window.innerHeight;
        const difference = panelHeight - windowHeight;

        // Calculate "fake scroll ratio" - this creates extra scroll distance
        // when panel content is taller than viewport, allowing smooth scrolling
        // through tall content while the panel stays pinned
        const fakeScrollRatio =
          difference > 0 ? difference / (difference + windowHeight) : 0;

        // Add bottom margin to create additional scroll space for tall panels
        // This ensures the pinned panel has enough scroll distance to complete its animation
        if (fakeScrollRatio) {
          panel.style.marginBottom = panelHeight * fakeScrollRatio + 'px';
        }

        // Create a GSAP timeline controlled by scroll position
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: panel, // Element that triggers the animation
            start: 'bottom bottom', // Animation starts when panel's bottom hits viewport bottom
            end: () =>
              fakeScrollRatio
                ? `+=${innerpanel.offsetHeight}` // For tall panels, extend scroll distance
                : 'bottom top', // For short panels, end when panel bottom hits viewport top
            pinSpacing: false, // Don't add extra spacing when pinning
            pin: true, // Pin the panel to viewport during scroll
            scrub: true, // Animation progress is directly tied to scroll position (smooth scrubbing)
          },
        });

        // If panel content is taller than viewport, animate inner content scrolling up
        // This creates the effect of content scrolling while panel stays fixed
        if (fakeScrollRatio) {
          tl.to(innerpanel, {
            yPercent: -100, // Move inner content up by 100% of its height
            y: windowHeight, // Also offset by window height for precise positioning
            duration: 1 / (1 - fakeScrollRatio) - 1, // Duration calculated to match scroll distance
            ease: 'none', // Linear easing for smooth scrubbing
          });
        }

        // Animate the panel itself: scale down and fade out as you scroll
        // This creates a "zooming out" effect as the next panel approaches
        tl.fromTo(
          panel,
          { scale: 1, opacity: 1 }, // Start: full size, fully visible
          { scale: 0.7, opacity: 0.5, duration: 0.9 } // End: 70% size, 50% opacity
        ).to(panel, { opacity: 0, duration: 0.1 }); // Final: completely transparent
      });

      // ============================================
      // SECTION 2: ORBITING RECTANGLE ANIMATION
      // ============================================
      // Animates a small rectangle (#motion-rect) to continuously orbit
      // around a circular path (#orbit-path) in the profile image section.
      // This creates a subtle, continuous motion effect.

      gsap.to('#motion-rect', {
        motionPath: {
          path: '#orbit-path', // SVG path element to follow (circular path)
          align: '#orbit-path', // Align the element to the path's orientation
          alignOrigin: [0.5, 0.5], // Center point for alignment (middle of element)
        },
        duration: 20, // One complete orbit takes 20 seconds
        ease: 'none', // Constant speed (no acceleration/deceleration)
        repeat: -1, // Infinite loop (-1 means repeat forever)
      });

      // ============================================
      // SECTION 3: SPLIT TEXT ANIMATIONS
      // ============================================
      // Creates a 3D flip-up animation for text elements with class "split-text".
      // Each character is animated individually to create a cascading reveal effect.

      panels.forEach((panel, i) => {
        // Find all elements with .split-text class in this panel
        const targets = panel.querySelectorAll('.split-text');
        targets.forEach((el) => {
          // Split text into individual characters and words using SplitText plugin
          // This allows us to animate each character independently
          const split = SplitText.create(el, { type: 'chars,words' });

          // Set initial state for all characters:
          // - Positioned 60px below their final position
          // - Completely transparent
          // - Rotated -90 degrees on X-axis (flipped backward, creating 3D effect)
          // - Transform origin set to create a 3D rotation point
          gsap.set(split.chars, {
            y: 60, // Start 60px below
            opacity: 0, // Start invisible
            rotateX: -90, // Start rotated backward (3D flip effect)
            transformOrigin: '50% 50% -30px', // Rotation point for 3D effect
          });

          // First panel (index 0): Animate immediately on page load
          if (i === 0) {
            gsap.to(split.chars, {
              y: 0, // Move to final position
              opacity: 1, // Fade in
              rotateX: 0, // Rotate to normal orientation
              duration: 0.8, // Animation duration
              stagger: 0.04, // 0.04s delay between each character (cascading effect)
              ease: 'back.out(1.7)', // Bouncy easing for playful effect
              delay: 0.3, // Wait 0.3s before starting
            });
          } else {
            // Other panels: Animate when panel enters viewport
            ScrollTrigger.create({
              trigger: panel, // Watch this panel
              start: 'top 60%', // Trigger when panel top reaches 60% down the viewport
              onEnter: () => {
                // When panel enters trigger zone, animate characters
                gsap.to(split.chars, {
                  y: 0, // Move to final position
                  opacity: 1, // Fade in
                  rotateX: 0, // Rotate to normal orientation
                  duration: 0.8, // Animation duration
                  stagger: 0.04, // 0.04s delay between each character
                  ease: 'back.out(1.7)', // Bouncy easing
                });
              },
            });
          }
        });
      });

      // ============================================
      // SECTION 4: FLOATING BOX PATH ANIMATION & SHAPE MORPHING
      // ============================================
      // Animates a floating SVG box (.plot-box) to move between sections
      // while simultaneously morphing its shape. The box follows a curved path and
      // changes shape as you scroll through panels AND the standalone Projects section.

      // Calculate viewport dimensions for responsive positioning
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // Define sizes for the floating box and panel markers
      const boxSize = 96; // Size of the floating SVG box
      const markerSize = 64; // Size of invisible markers in each panel
      const halfBox = boxSize / 2;
      const halfMarker = markerSize / 2;

      // Starting position of the floating box (top-right area)
      const boxCenterX = vw * 0.70; // 70% from left
      const boxCenterY = vh * 0.10 + halfBox; // 10% from top, adjusted for box center

      // SVG path strings for shape morphing
      const morphShapeLibrary = {
        profile:
          'M61.44,0A61.46,61.46,0,1,1,18,18,61.21,61.21,0,0,1,61.44,0ZM49.28,71.35c.26-2.18-6.23-10.54-7.41-14.54-2.54-4-3.44-10.46-.68-14.73,1.11-1.69.63-3.16.63-5.51,0-23.24,40.7-23.24,40.7,0,0,2.94-.67,3.63.92,6,2.66,3.86,1.29,10.72-1,14.3C81,61,74.24,69,74.71,71.37c.42,11.92-25.5,11.53-25.43,0v0Zm-31,20.07c3.25-3.6,9.09-3.76,16.17-7.36a74.7,74.7,0,0,0,7.75-4.53c8.22,10.08,15,21.16,12.78,34.05a52.65,52.65,0,0,0,6.44.4c.55,0,1.09,0,1.64,0-.5-15.14,8.38-26.21,17.79-35.63A68.55,68.55,0,0,0,96.33,86c4.62,1.54,7.39,2.53,9,4.3a52.54,52.54,0,1,0-87,1.08Z',
        diamond: 'M39.01,79.72c-1.38,0-2.49-1.33-2.49-2.97c0-1.64,1.12-2.97,2.49-2.97h13.63c1.38,0,2.49,1.33,2.49,2.97 c0,1.64-1.12,2.97-2.49,2.97H39.01L39.01,79.72z M85.66,67.41c7.66,0,14.59,3.1,19.61,8.12c5.02,5.02,8.12,11.95,8.12,19.61 s-3.1,14.59-8.12,19.61c-5.02,5.02-11.95,8.12-19.61,8.12s-14.59-3.1-19.61-8.12c-5.02-5.02-8.12-11.95-8.12-19.61 s3.1-14.59,8.12-19.61C71.07,70.51,78,67.41,85.66,67.41L85.66,67.41z M83.54,82.17c0-1.37,1.11-2.48,2.48-2.48 c1.37,0,2.48,1.11,2.48,2.48v12.92l9.66,5.72c1.18,0.69,1.57,2.21,0.87,3.39c-0.69,1.18-2.21,1.57-3.39,0.87L84.89,98.7 c-0.8-0.41-1.35-1.24-1.35-2.21V82.17L83.54,82.17z M101.77,79.04c-4.12-4.12-9.82-6.67-16.11-6.67c-6.29,0-11.99,2.55-16.11,6.67 c-4.12,4.12-6.67,9.82-6.67,16.11c0,6.29,2.55,11.99,6.67,16.11c4.12,4.12,9.82,6.67,16.11,6.67c6.29,0,11.99-2.55,16.11-6.67 c4.12-4.12,6.67-9.82,6.67-16.11S105.89,83.16,101.77,79.04L101.77,79.04z M44.1,109.94c1.64,0,2.97,1.33,2.97,2.97 c0,1.64-1.33,2.97-2.97,2.97H6.92c-1.9,0-3.63-0.78-4.89-2.03C0.78,112.6,0,110.87,0,108.97V6.92c0-1.91,0.78-3.63,2.03-4.89 C3.28,0.78,5.01,0,6.92,0h84.9c1.9,0,3.63,0.78,4.89,2.03c1.25,1.25,2.03,2.98,2.03,4.89V54.2c0,1.64-1.33,2.97-2.97,2.97 c-1.64,0-2.97-1.33-2.97-2.97V6.92c0-0.26-0.11-0.5-0.29-0.68c-0.18-0.18-0.42-0.29-0.68-0.29H6.92c-0.26,0-0.51,0.11-0.68,0.29 C6.05,6.41,5.94,6.65,5.94,6.92v102.05c0,0.26,0.11,0.51,0.29,0.68c0.18,0.18,0.42,0.29,0.68,0.29H44.1L44.1,109.94z M19.12,72.49 h7.45c0.54,0,0.98,0.44,0.98,0.98v7.45c0,0.54-0.44,0.98-0.98,0.98h-7.45c-0.54,0-0.98-0.44-0.98-0.98v-7.45 C18.15,72.92,18.59,72.49,19.12,72.49L19.12,72.49z M19.12,21.49h7.45c0.54,0,0.98,0.44,0.98,0.98v7.45c0,0.54-0.44,0.98-0.98,0.98 h-7.45c-0.54,0-0.98-0.44-0.98-0.98v-7.45C18.15,21.93,18.59,21.49,19.12,21.49L19.12,21.49z M39.01,28.72 c-1.38,0-2.49-1.33-2.49-2.97s1.12-2.97,2.49-2.97h35.46c1.38,0,2.49,1.33,2.49,2.97s-1.12,2.97-2.49,2.97H39.01L39.01,28.72z M22.17,56.14c-0.64,0.51-1.56,0.38-2.21-0.25c-0.07-0.05-0.14-0.11-0.21-0.18l-3.12-3.22c-0.65-0.68-0.5-1.81,0.34-2.53 c0.84-0.72,2.05-0.76,2.71-0.08l1.7,1.75l5.47-4.4c0.73-0.59,1.85-0.33,2.49,0.57c0.64,0.9,0.56,2.11-0.17,2.7L22.17,56.14 L22.17,56.14z M37.37,53.65c-1.38,0-2.49-1.33-2.49-2.97c0-1.64,1.12-2.97,2.49-2.97h35.46c1.38,0,2.49,1.33,2.49,2.97 c0,1.64-1.12,2.97-2.49,2.97H37.37L37.37,53.65z', // Diamond — for Projects section
        star: 'M47.48,108.43c2.21,0,4,1.79,4,4c0,2.21-1.79,4-4,4c-2.21,0-4-1.79-4-4 C43.48,110.22,45.27,108.43,47.48,108.43L47.48,108.43z M21.64,67.48c-0.06-0.12-0.13-0.23-0.21-0.34 c-0.35-0.57-0.7-1.14-1.05-1.79c-0.35-0.7-0.7-1.36-1.01-1.97c-0.31-0.66-0.61-1.36-0.87-2.06c-0.22-0.61-0.48-1.31-0.74-2.14 c-0.39-1.18-1.49-1.92-2.67-1.92H7.52c-0.26,0-0.52-0.04-0.7-0.13c-0.17-0.09-0.39-0.22-0.52-0.39c-0.17-0.18-0.31-0.35-0.39-0.52 c-0.09-0.17-0.13-0.44-0.13-0.7v-9.54c0-0.26,0.04-0.48,0.09-0.66c0.09-0.18,0.22-0.39,0.44-0.61c0.17-0.17,0.35-0.31,0.52-0.35 c0.18-0.09,0.44-0.13,0.7-0.13h6.95c1.4,0,2.54-1.01,2.8-2.32c0.17-0.74,0.35-1.44,0.52-2.06c0.22-0.7,0.44-1.36,0.7-2.06 c0.26-0.66,0.52-1.36,0.87-2.01c0.31-0.7,0.66-1.31,0.96-1.92c0.61-1.14,0.39-2.45-0.48-3.32l-5.42-5.47 c-0.04-0.04-0.04-0.04-0.09-0.04c-0.17-0.17-0.31-0.35-0.39-0.52c-0.09-0.17-0.09-0.35-0.09-0.61c0-0.26,0.04-0.48,0.13-0.66 c0.09-0.22,0.22-0.39,0.44-0.61l6.69-6.65c0.22-0.22,0.39-0.35,0.61-0.44c0.18-0.09,0.39-0.13,0.66-0.13 c0.26,0,0.48,0.04,0.66,0.13c0.18,0.09,0.39,0.22,0.57,0.39h0.04l4.94,4.94c0.96,0.96,2.49,1.09,3.59,0.31 c0.57-0.35,1.14-0.7,1.79-1.05c0.7-0.35,1.36-0.7,1.97-1.01c0.66-0.31,1.36-0.61,2.06-0.87c0.61-0.22,1.31-0.48,2.14-0.74 c1.18-0.39,1.92-1.49,1.92-2.67V7.26c0-0.26,0.04-0.52,0.13-0.7c0.09-0.17,0.22-0.35,0.35-0.52c0.18-0.17,0.35-0.31,0.52-0.35 c0.17-0.09,0.44-0.13,0.7-0.13h6.72h0.08h0.69c0.26,0,0.52,0.04,0.7,0.13c0.17,0.04,0.35,0.18,0.52,0.35 c0.13,0.17,0.26,0.35,0.35,0.52c0.09,0.17,0.13,0.44,0.13,0.7v7.57c0,1.18,0.74,2.27,1.92,2.67c0.83,0.26,1.53,0.52,2.14,0.74 c0.7,0.26,1.4,0.57,2.06,0.87c0.61,0.31,1.27,0.66,1.97,1.01c0.66,0.35,1.22,0.7,1.79,1.05c1.09,0.79,2.62,0.66,3.59-0.31 l4.94-4.94h0.04c0.17-0.17,0.39-0.31,0.57-0.39c0.17-0.09,0.39-0.13,0.66-0.13c0.26,0,0.48,0.04,0.66,0.13 c0.22,0.09,0.39,0.22,0.61,0.44l6.69,6.65c0.22,0.22,0.35,0.39,0.44,0.61c0.09,0.17,0.13,0.39,0.13,0.66c0,0.26,0,0.44-0.09,0.61 c-0.09,0.18-0.22,0.35-0.39,0.52c-0.04,0-0.04,0-0.09,0.04l-5.42,5.47c-0.87,0.87-1.09,2.19-0.48,3.32 c0.31,0.61,0.66,1.22,0.96,1.92c0.35,0.66,0.61,1.36,0.87,2.01c0.26,0.7,0.48,1.36,0.7,2.06c0.17,0.61,0.35,1.31,0.52,2.06 c0.26,1.31,1.4,2.32,2.8,2.32h6.95c0.26,0,0.52,0.04,0.7,0.13c0.17,0.04,0.35,0.17,0.52,0.35c0.22,0.22,0.35,0.44,0.44,0.61 c0.04,0.17,0.09,0.39,0.09,0.66v9.54c0,0.26-0.04,0.52-0.13,0.7c-0.09,0.18-0.22,0.35-0.39,0.52c-0.13,0.17-0.35,0.31-0.52,0.39 c-0.18,0.09-0.44,0.13-0.7,0.13h-7.57c-1.18,0-2.27,0.74-2.67,1.92c-0.26,0.83-0.52,1.53-0.74,2.14c-0.26,0.7-0.57,1.4-0.87,2.06 c-0.31,0.61-0.66,1.27-1.01,1.97c-0.35,0.66-0.7,1.23-1.05,1.79c-0.08,0.11-0.15,0.22-0.21,0.34h6.62 c0.28-0.56,0.56-1.16,0.85-1.78c0.35-0.79,0.7-1.57,1.01-2.36c0.04-0.13,0.13-0.31,0.18-0.44h5.6c1.01,0,1.97-0.17,2.84-0.52 c0.87-0.35,1.71-0.92,2.41-1.62c0.7-0.7,1.27-1.49,1.62-2.41c0.35-0.92,0.52-1.84,0.52-2.84v-9.53c0-0.96-0.22-1.92-0.57-2.8 c-0.35-0.87-0.87-1.66-1.57-2.36l-0.04-0.04c-0.7-0.7-1.49-1.27-2.36-1.62c-0.87-0.39-1.84-0.57-2.84-0.57l-4.77,0 c0-0.13-0.04-0.22-0.09-0.35c-0.26-0.83-0.52-1.66-0.83-2.45c-0.35-0.83-0.66-1.62-1.01-2.36c-0.04-0.09-0.13-0.22-0.17-0.35 l3.94-3.98c0.74-0.66,1.27-1.44,1.66-2.32c0.35-0.87,0.57-1.84,0.57-2.84c0-1.01-0.17-1.92-0.57-2.84 c-0.39-0.87-0.92-1.66-1.62-2.36h-0.04l-6.69-6.65c-0.7-0.7-1.49-1.22-2.41-1.62c-0.92-0.39-1.84-0.57-2.84-0.57 c-0.96,0-1.92,0.17-2.84,0.57c-0.92,0.35-1.71,0.92-2.41,1.62l-3.41,3.37l-0.26-0.13c-0.7-0.39-1.49-0.74-2.32-1.14 c-0.79-0.35-1.57-0.7-2.36-1.01c-0.13-0.04-0.31-0.13-0.44-0.18v-5.6c0-1.01-0.17-1.97-0.52-2.84c-0.35-0.88-0.92-1.71-1.62-2.41 c-0.74-0.7-1.53-1.27-2.41-1.62C53.29,0.17,52.37,0,51.36,0h-3.45h-0.77h-3.45c-1.01,0-1.92,0.17-2.84,0.52 c-0.87,0.35-1.66,0.92-2.41,1.62c-0.7,0.7-1.27,1.53-1.62,2.41c-0.35,0.87-0.52,1.84-0.52,2.84v5.6c-0.13,0.04-0.31,0.13-0.44,0.18 c-0.79,0.31-1.57,0.66-2.36,1.01c-0.83,0.39-1.62,0.74-2.32,1.14l-0.26,0.13l-3.41-3.37c-0.7-0.7-1.49-1.27-2.41-1.62 c-0.92-0.39-1.88-0.57-2.84-0.57c-1.01,0-1.92,0.17-2.84,0.57c-0.92,0.39-1.71,0.92-2.41,1.62l-6.69,6.65h-0.04 c-0.7,0.7-1.22,1.49-1.62,2.36C8.27,22,8.09,22.92,8.09,23.92c0,1.01,0.22,1.97,0.57,2.84c0.39,0.87,0.92,1.66,1.66,2.32l3.94,3.98 c-0.04,0.13-0.13,0.26-0.17,0.35c-0.35,0.74-0.66,1.53-1.01,2.36c-0.31,0.79-0.57,1.62-0.83,2.45c-0.04,0.13-0.09,0.22-0.09,0.35 l-4.77,0c-1.01,0-1.97,0.18-2.84,0.57c-0.87,0.35-1.66,0.92-2.36,1.62l-0.04,0.04c-0.7,0.7-1.22,1.49-1.57,2.36 C0.22,44.04,0,45.01,0,45.97v9.53c0,1.01,0.17,1.92,0.52,2.84c0.35,0.92,0.92,1.71,1.62,2.41c0.7,0.7,1.53,1.27,2.41,1.62 c0.87,0.35,1.84,0.52,2.84,0.52h5.6c0.04,0.13,0.13,0.31,0.18,0.44c0.31,0.79,0.66,1.57,1.01,2.36c0.3,0.63,0.57,1.23,0.85,1.78 H21.64L21.64,67.48z M32.47,58.63c-0.83,0.03-1.47,0.2-1.9,0.5c-0.25,0.17-0.43,0.38-0.54,0.63c-0.13,0.28-0.19,0.62-0.18,1.01 c0.03,1.14,0.63,2.64,1.79,4.37l0.02,0.02l3.76,5.99c1.51,2.4,3.09,4.85,5.06,6.64c1.89,1.73,4.18,2.9,7.22,2.91 c3.28,0.01,5.69-1.21,7.64-3.03c2.03-1.9,3.63-4.5,5.2-7.1l4.24-6.98c0.79-1.8,1.08-3.01,0.9-3.72c-0.11-0.42-0.57-0.63-1.37-0.67 c-0.17-0.01-0.34-0.01-0.52-0.01c-0.19,0.01-0.39,0.02-0.59,0.04c-0.11,0.01-0.22,0-0.33-0.02c-0.38,0.02-0.77-0.01-1.16-0.06 l1.45-6.43c-10.77,1.7-18.83-6.3-30.22-1.6l0.82,7.57C33.31,58.7,32.87,58.69,32.47,58.63L32.47,58.63L32.47,58.63L32.47,58.63z M65.76,57.28c1.04,0.32,1.71,0.98,1.99,2.05c0.3,1.19-0.03,2.86-1.03,5.14l0,0c-0.02,0.04-0.04,0.08-0.06,0.12l-4.29,7.06 c-1.65,2.72-3.33,5.45-5.57,7.55l-0.11,0.1c0.21,0.31,0.45,0.65,0.69,1.01c0.74,1.09,1.59,2.34,2.38,3.31 c4.66,2.9,14.91,3.68,18.92,5.91c10.2,5.69,6.48,19.51,7.22,29.45c-0.22,2.35-1.55,3.7-4.17,3.9h-2.83l3.11-23.57 c0.24-1.84-1.06-3.34-2.67-3.34H57.47c0.54-3.85,0.93-7.53,1.12-10.31c-1.02-1.13-2.11-2.73-3.05-4.11c-0.21-0.3-0.41-0.6-0.6-0.87 c-1.97,1.32-4.31,2.14-7.24,2.13c-3.27-0.01-5.82-1.13-7.93-2.84c-0.59,1.77-1.46,4.21-2.3,5.38c-0.07,0.1-0.16,0.19-0.26,0.26 c0.36,2.87,0.86,6.55,1.45,10.37h-22.4c-1.6,0-2.91,1.5-2.67,3.34l3.11,23.57h-2.84c-2.62-0.2-3.95-1.55-4.17-3.9 c0.13-10.53-3.87-23.27,7.22-29.45c4.06-2.27,14.53-3.04,19.1-6.03c0.7-1.31,1.47-3.67,1.94-5.07c0.05-0.16-0.03,0.1,0.05-0.13 c-1.68-1.8-3.05-3.93-4.37-6.03l-3.76-5.98c-1.38-2.05-2.09-3.93-2.14-5.47c-0.02-0.72,0.1-1.38,0.37-1.96 c0.28-0.6,0.71-1.11,1.29-1.5c0.27-0.18,0.58-0.34,0.91-0.47c-0.24-3.25-0.34-7.34-0.18-10.76c0.08-0.81,0.24-1.63,0.46-2.44 c1.38-4.92,5.61-8.47,10.44-10.14c2.34-0.81,1.44-2.74,3.81-2.61c5.62,0.31,14.28,3.93,17.61,7.77 C67.12,44.09,65.91,50.71,65.76,57.28L65.76,57.28L65.76,57.28L65.76,57.28z M40.04,90.19c-1.9-2.16-2.06-4.42,0-6.81 c2.38,0.6,4.56,1.63,6.57,3.02c0.43-0.19,0.94-0.27,1.43-0.23c2.09-1.48,4.75-2.08,7.08-3.19c2.78,2.71,2.48,5.2-0.25,7.51 c-1.53-0.35-2.98-0.89-4.37-1.6c-0.04,0.36-0.13,0.75-0.3,1.17l0.71,5.91h-5.67l0.71-5.91c-0.44-0.75-0.61-1.39-0.6-1.92 C43.7,89.13,41.91,89.77,40.04,90.19L40.04,90.19L40.04,90.19z',
        hexagon: 'M48,2 L88,25 L88,71 L48,94 L8,71 L8,25Z',
        plus: 'M34,4 L62,4 L62,34 L92,34 L92,62 L62,62 L62,92 L34,92 L34,62 L4,62 L4,34 L34,34Z',
      };

      // Find the standalone Projects section (it's NOT a .panel)
      const projectsSection = document.querySelector('.projects-section') as HTMLElement | null;

      // Build an ordered list of all morph targets (panels + projects) in scroll order.
      // Each entry has: trigger element, target center position, morph shape,
      // and optional ScrollTrigger start/end overrides.
      interface MorphTarget {
        trigger: HTMLElement;
        cx: number;
        cy: number;
        shape: string;
        start?: string;
        end?: string;
      }

      const morphTargets: MorphTarget[] = [];

      // 1. About panel (panels[1]) — morphs to profile silhouette
      if (panels[1]) {
        morphTargets.push({
          trigger: panels[1],
          cx: vw * 0.475 + halfMarker,
          cy: vh * 0.15 + halfMarker,
          shape: morphShapeLibrary.profile,
        });
      }

      // 2. Projects section (standalone, sits between About and next panel)
      //    Morph completes as the section enters and reaches the top of the viewport.
      if (projectsSection) {
        morphTargets.push({
          trigger: projectsSection,
          cx: vw * 0.48,
          cy: vh * 0.15 + halfMarker,
          shape: morphShapeLibrary.diamond,
          start: 'top bottom',
          end: 'top top', // Complete before pinning starts
        });
      }

      // 3. Remaining panels after About (THREE, FOUR, FIVE = panels[2], [3], [4])
      const remainingPanelMorphs = [
        { cx: vw * 0.48 + halfMarker, cy: vh * 0.18 + halfMarker, shape: morphShapeLibrary.star },
        { cx: vw * 0.48 + halfMarker, cy: vh * 0.18 + halfMarker, shape: morphShapeLibrary.hexagon },
        { cx: vw * 0.48 + halfMarker, cy: vh * 0.18 + halfMarker, shape: morphShapeLibrary.plus },
      ];

      panels.slice(2).forEach((panel, i) => {
        if (i < remainingPanelMorphs.length) {
          morphTargets.push({
            trigger: panel,
            ...remainingPanelMorphs[i],
          });
        }
      });

      // Animate each morph segment: move the box and morph its shape
      morphTargets.forEach((target, i) => {
        // Previous position (origin for first target, or last target's position)
        const prevPt =
          i === 0
            ? { x: 0, y: 0 }
            : {
                x: morphTargets[i - 1].cx - boxCenterX,
                y: morphTargets[i - 1].cy - boxCenterY,
              };
        // Current target position (relative to starting box position)
        const curPt = {
          x: target.cx - boxCenterX,
          y: target.cy - boxCenterY,
        };

        const segTl = gsap.timeline({
          scrollTrigger: {
            trigger: target.trigger,
            start: target.start || 'top bottom',
            end: target.end || 'bottom bottom',
            scrub: true,
          },
        });

        // Animate all three properties simultaneously:
        // 1. Horizontal movement with sine easing (creates arc effect)
        segTl
          .fromTo(
            '.plot-box',
            { x: prevPt.x },
            { x: curPt.x, ease: 'sine.inOut', immediateRender: false },
            0,
          )
          // 2. Vertical movement with power2.in easing (different easing = curved path)
          .fromTo(
            '.plot-box',
            { y: prevPt.y },
            { y: curPt.y, ease: 'power2.in', immediateRender: false },
            0,
          )
          // 3. Shape morphing using MorphSVG plugin
          .to(
            '#plot-shape',
            { morphSVG: target.shape, ease: 'power2.inOut', immediateRender: false },
            0,
          );
      });
    },
    { scope: main }
  );

  return (
    <main ref={main}>
      {/* SVG that follows a curvy path through each panel's marker and morphs shape */}
      <svg
        className="plot-box fixed z-50 pointer-events-none will-change-transform"
        style={{
          left: 'calc(70% - 3rem)',
          top: '10%',

        }}
        width="96"
        height="96"
        viewBox="0 0 96 96"
        fill="none"
        overflow="visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="plot-grad" x1="0" y1="0" x2="96" y2="96" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <path
          id="plot-shape"
          d="M16,0 H80 C88.8,0,96,7.2,96,16 V80 C96,88.8,88.8,96,80,96 H16 C7.2,96,0,88.8,0,80 V16 C0,7.2,7.2,0,16,0Z"
          fill="oklch(62.3% 0.214 259.815)"

        />
      </svg>
      <section className="description panel dark relative">
        <GridPattern />
        <div className="section-content">
          <div className="section-inner">
            <div className="flex items-center sm:p-12 sm:py-0 sm:pb-0 p-0  pb-2 ">
              <div className="w-full h-full  mx-auto pt-8  relative flex justify-start">
                <div className="flex justify-center flex-col gap-8 items-center place-items-center ">
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
                  <div className="space-y-4 col-span-2 text-center flex flex-col items-center justify-center ">
                    <div

                      className="space-y-2"
                    >
                      <p className=" text-3xl text-white sm:text-3xl md:text-3xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold tracking-tight flex justify-center  ">
                        Hi there, I&apos;m
                      </p>
                      <span className=" title relative text-blue-500 text-7xl sm:text-7xl md:text-7xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-bold  flex justify-center   ">
                        Tebi Njeik
                      </span>
                    </div>

                   
                      <p

                        className="text-base sm:text-lg lg:text-xl text-gray-400  md:w-3/5 pb-4 sm:pb-0 "
                      >
                        An experienced and skilled Full-stack Developer from Cameroon with a passion for creating seamless user experiences and building scalable applications.
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
      <section className="panel light border-4 border-white">

        <div className="section-content">
          <div className="section-inner">
            <h1 className="text-7xl text-blue-500 font-bold title">About Me</h1>
            <About />
          </div>
        </div>
      </section>
      {/* Projects section — standalone, NOT a .panel.
          It owns its own ScrollTrigger pin so the panel system doesn't interfere. */}
      <Projects />
      <section className="panel light">
        <div className="absolute inset-0 pointer-events-none">
          <div className="plot-marker absolute left-[18%] top-[50%] w-16 h-16 rounded-xl border-2 border-dashed border-black/25" />
        </div>
        <div className="section-content">
          <div className="section-inner">
            <h1 className="split-text">THREE</h1>
          </div>
        </div>
      </section>
      <section className="panel dark">
        <div className="absolute inset-0 pointer-events-none">
          <div className="plot-marker absolute left-[60%] top-[60%] w-16 h-16 rounded-xl border-2 border-dashed border-white/25" />
        </div>
        <div className="section-content">
          <div className="section-inner">
            <h1 className="split-text">FOUR</h1>
          </div>
        </div>
      </section>
      <section className="panel light">
        <div className="absolute inset-0 pointer-events-none">
          <div className="plot-marker absolute left-[20%] top-[70%] w-16 h-16 rounded-xl border-2 border-dashed border-black/25" />
        </div>
        <div className="section-content">
          <div className="section-inner">
            <h1 className="split-text">FIVE</h1>
          </div>
        </div>
      </section>
    </main>
  );
}
