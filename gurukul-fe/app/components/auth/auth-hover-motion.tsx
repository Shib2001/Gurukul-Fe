"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

export function AuthHoverMotion() {
  useGSAP(() => {
    const media = gsap.matchMedia();

    media.add(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
      () => {
        const scope = document.documentElement;

        type TiltAnimation = {
          rotateX: (value: number) => void;
          rotateY: (value: number) => void;
          translateZ: (value: number) => void;
        };
        const animations = new WeakMap<HTMLElement, TiltAnimation>();
        const initializedTargets = new Set<HTMLElement>();
        let activeTarget: HTMLElement | null = null;
        let activeBounds: DOMRect | null = null;

        const getTarget = (element: EventTarget | null) => {
          if (!(element instanceof Element)) return null;
          return element.closest<HTMLElement>("[data-hover-tilt]");
        };

        const animateButton = (target: HTMLElement, hovered: boolean) => {
          if (!target.matches(".auth-submit")) return;
          gsap.to(target, {
            backgroundColor: hovered ? "#ee5d58" : "#24231f",
            boxShadow: hovered ? "5px 6px 0 #24231f" : "3px 4px 0 #ee5d58",
            duration: hovered ? 0.3 : 0.35,
            ease: "power2.out",
            overwrite: "auto",
          });
        };

        const animateInput = (target: HTMLElement, hovered: boolean) => {
          if (!target.matches(".auth-field input")) return;
          const isKeyboardFocused = target.matches(":focus-visible");
          gsap.to(target, {
            borderColor: hovered ? "#ee5d58" : isKeyboardFocused ? "#24231f" : "#c9c4b8",
            boxShadow: hovered
              ? "4px 4px 0 #f2c94c"
              : isKeyboardFocused
                ? "3px 3px 0 #f2c94c"
                : "none",
            duration: hovered ? 0.25 : 0.3,
            ease: "power2.out",
            overwrite: "auto",
          });
        };

        const getAnimation = (target: HTMLElement) => {
          const existing = animations.get(target);
          if (existing) return existing;

          gsap.set(target, {
            transformOrigin: "center center",
            transformPerspective: 900,
          });

          const animation: TiltAnimation = {
            rotateX: gsap.quickTo(target, "rotationX", {
              duration: 0.35,
              ease: "power3.out",
            }),
            rotateY: gsap.quickTo(target, "rotationY", {
              duration: 0.35,
              ease: "power3.out",
            }),
            translateZ: gsap.quickTo(target, "z", {
              duration: 0.35,
              ease: "power3.out",
            }),
          };

          animations.set(target, animation);
          initializedTargets.add(target);
          return animation;
        };

        const resetActiveTarget = () => {
          if (!activeTarget) return;
          const animation = animations.get(activeTarget);
          if (animation) {
            animation.rotateX(0);
            animation.rotateY(0);
            animation.translateZ(0);
          }
          animateButton(activeTarget, false);
          animateInput(activeTarget, false);
          activeTarget = null;
          activeBounds = null;
        };

        const activateTarget = (target: HTMLElement) => {
          if (activeTarget === target) return;
          resetActiveTarget();
          const animation = getAnimation(target);
          activeTarget = target;
          activeBounds = target.getBoundingClientRect();
          animation.translateZ(Number(target.dataset.hoverDepth) || 8);
          if (target.matches(".auth-submit")) {
            animateButton(target, true);
          } else if (target.matches(".auth-field input")) {
            animateInput(target, true);
          }
        };

        const handlePointerOver = (event: PointerEvent) => {
          const target = getTarget(event.target);
          if (!target || getTarget(event.relatedTarget) === target) return;
          activateTarget(target);
        };

        const handlePointerMove = (event: PointerEvent) => {
          if (event.pointerType === "touch") return;
          const target = getTarget(event.target);
          if (target) activateTarget(target);
          if (!activeTarget || !activeBounds) return;

          const bounds = activeBounds;
          if (
            !bounds.width ||
            !bounds.height ||
            event.clientX < bounds.left - 10 ||
            event.clientX > bounds.right + 10 ||
            event.clientY < bounds.top - 10 ||
            event.clientY > bounds.bottom + 10
          ) {
            resetActiveTarget();
            return;
          }

          const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5;
          const vertical = (event.clientY - bounds.top) / bounds.height - 0.5;
          const intensity = Number(activeTarget.dataset.hoverTilt) || 3;
          const animation = getAnimation(activeTarget);

          animation.rotateX(-vertical * intensity * 2);
          animation.rotateY(horizontal * intensity * 2);
        };

        const handlePointerOut = (event: PointerEvent) => {
          if (event.relatedTarget === null) resetActiveTarget();
        };

        scope.addEventListener("pointerover", handlePointerOver);
        scope.addEventListener("pointermove", handlePointerMove);
        scope.addEventListener("pointerout", handlePointerOut);
        scope.addEventListener("pointercancel", resetActiveTarget);
        scope.addEventListener("scroll", resetActiveTarget, true);

        return () => {
          scope.removeEventListener("pointerover", handlePointerOver);
          scope.removeEventListener("pointermove", handlePointerMove);
          scope.removeEventListener("pointerout", handlePointerOut);
          scope.removeEventListener("pointercancel", resetActiveTarget);
          scope.removeEventListener("scroll", resetActiveTarget, true);
          resetActiveTarget();
          initializedTargets.forEach((target) => {
            gsap.killTweensOf(target);
            gsap.set(target, {
              clearProps: "transform,transformOrigin,backgroundColor,boxShadow",
            });
          });
        };
      },
    );

    return () => media.revert();
  }, []);

  return null;
}
