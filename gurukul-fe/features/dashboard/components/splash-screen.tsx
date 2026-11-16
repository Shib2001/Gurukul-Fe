"use client";

import { useGSAP } from "@gsap/react";
import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const titleRef = useRef<HTMLParagraphElement>(null);
  const underlineRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const doodleRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [logoRef.current, titleRef.current, underlineRef.current, progressRef.current, doodleRef.current],
          { autoAlpha: 1, scale: 1, x: 0, y: 0, rotation: 0 },
        );
        const timer = window.setTimeout(onComplete, 450);
        return () => window.clearTimeout(timer);
      });

      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(logoRef.current, { autoAlpha: 0, scale: 0.82, y: 16, rotation: -5 });
        gsap.set(titleRef.current, { autoAlpha: 0, y: 12 });
        gsap.set(underlineRef.current, { scaleX: 0, transformOrigin: "left center" });
        gsap.set(progressRef.current, { scaleX: 0, transformOrigin: "left center" });
        gsap.set(doodleRef.current, { autoAlpha: 0, scale: 0.5, rotation: -35 });

        gsap
          .timeline({
            defaults: { ease: "power3.out" },
            onComplete,
          })
          .to(logoRef.current, {
            autoAlpha: 1,
            scale: 1,
            y: 0,
            rotation: 0,
            duration: 0.72,
          })
          .to(doodleRef.current, {
            autoAlpha: 1,
            scale: 1,
            rotation: 0,
            duration: 0.4,
          }, "-=0.28")
          .to(titleRef.current, { autoAlpha: 1, y: 0, duration: 0.48 }, "-=0.12")
          .to(underlineRef.current, { scaleX: 1, duration: 0.48, ease: "power2.inOut" }, "-=0.2")
          .to(progressRef.current, { scaleX: 1, duration: 0.78, ease: "power1.inOut" }, "-=0.05");
      });

      return () => media.revert();
    },
    { scope: rootRef },
  );

  return (
    <main
      className="relative grid min-h-svh overflow-hidden place-items-center bg-[#fbfaf6] px-6 text-[#292722] [background-image:radial-gradient(#26231d_0.5px,transparent_0.5px)] [background-size:18px_18px]"
      ref={rootRef}
      aria-label="Gurukul.ai"
      aria-live="polite"
    >
      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0,transparent_calc(50%-0.5px),rgb(41_39_34_/_4%)_50%,transparent_calc(50%+0.5px))] motion-reduce:hidden" aria-hidden="true" />
      <span className="absolute left-[12%] top-[18%] rotate-12 font-serif text-4xl text-[#ee7066]/80" aria-hidden="true">✳</span>
      <span className="absolute bottom-[19%] right-[14%] -rotate-12 font-serif text-5xl text-[#f2c94c]" aria-hidden="true">✳</span>
      <span className="absolute right-[19%] top-[25%] rotate-6 font-serif text-3xl text-[#d8b8a1]" aria-hidden="true">〰</span>

      <section className="relative flex w-full max-w-[440px] flex-col items-center text-center">
        <div className="relative grid min-h-[150px] w-full place-items-center">
          <span
            ref={doodleRef}
            className="absolute right-[8%] top-[7%] z-10 grid size-12 place-items-center rounded-full border-[1.5px] border-[#292722] bg-[#f2c94c] font-serif text-2xl shadow-[3px_3px_0_#292722]"
            aria-hidden="true"
          >
            ✎
          </span>
          <Image
            ref={logoRef}
            src="/Gurukul.ai (B-FONT).png"
            alt="Gurukul.ai"
            width={280}
            height={90}
            priority
            className="h-auto w-[min(72vw,280px)] object-contain"
          />
        </div>

        <p
          ref={titleRef}
          className="mt-1 font-serif text-[clamp(23px,5vw,30px)] font-bold tracking-[-0.04em]"
        >
          A little curiosity <span className="text-[#ee5d58] italic">goes a long way.</span>
        </p>
        <div className="mt-3 h-[3px] w-40 overflow-hidden rounded-full bg-[#e6e0d4]" aria-hidden="true">
          <span ref={underlineRef} className="block h-full w-full rounded-full bg-[#ee5d58]" />
        </div>

        <div className="mt-12 w-48" role="status" aria-label="Getting your learning desk ready">
          <div className="h-1 overflow-hidden rounded-full bg-[#e8e2d7]">
            <span ref={progressRef} className="block h-full w-full rounded-full bg-[#f2c94c]" />
          </div>
          <p className="mt-3 text-[10px] font-bold tracking-[0.2em] text-[#777267]">
            GETTING YOUR DESK READY
          </p>
        </div>
      </section>

      <p className="absolute bottom-7 text-[11px] text-[#777267]">
        Made for curious minds <span className="text-[#ee5d58]" aria-hidden="true">✳</span>
      </p>
    </main>
  );
}
