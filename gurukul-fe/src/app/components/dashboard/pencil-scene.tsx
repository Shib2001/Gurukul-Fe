"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function PencilScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 30);
    camera.position.set(0, 0, 5.2);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.setAttribute("aria-hidden", "true");
    renderer.domElement.className = "absolute inset-0 h-full w-full";
    container.appendChild(renderer.domElement);
    const fallback = container.querySelector<HTMLElement>(".pencil-scene-fallback");
    if (fallback) fallback.hidden = true;

    scene.add(new THREE.HemisphereLight(0xfff9eb, 0x7d6250, 2.1));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(-3, 4, 5);
    scene.add(keyLight);

    const pencil = new THREE.Group();
    pencil.rotation.z = -0.2;
    scene.add(pencil);

    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.23, 2.3, 6),
      new THREE.MeshStandardMaterial({ color: 0xf2c94c, roughness: 0.58 }),
    );
    shaft.position.y = 0.08;
    pencil.add(shaft);

    const ferrule = new THREE.Mesh(
      new THREE.CylinderGeometry(0.205, 0.205, 0.16, 12),
      new THREE.MeshStandardMaterial({
        color: 0xb5b6b2,
        metalness: 0.72,
        roughness: 0.32,
      }),
    );
    ferrule.position.y = 1.31;
    pencil.add(ferrule);

    const eraser = new THREE.Mesh(
      new THREE.CylinderGeometry(0.19, 0.205, 0.3, 12),
      new THREE.MeshStandardMaterial({ color: 0xee7066, roughness: 0.62 }),
    );
    eraser.position.y = 1.53;
    pencil.add(eraser);

    const woodTip = new THREE.Mesh(
      new THREE.ConeGeometry(0.2, 0.48, 6),
      new THREE.MeshStandardMaterial({ color: 0xd7ad75, roughness: 0.85 }),
    );
    woodTip.rotation.z = Math.PI;
    woodTip.position.y = -1.31;
    pencil.add(woodTip);

    const graphite = new THREE.Mesh(
      new THREE.ConeGeometry(0.055, 0.17, 6),
      new THREE.MeshStandardMaterial({ color: 0x34312c, roughness: 0.75 }),
    );
    graphite.rotation.z = Math.PI;
    graphite.position.y = -1.61;
    pencil.add(graphite);

    const ferruleRibMaterial = new THREE.MeshStandardMaterial({
      color: 0xe7e5df,
      metalness: 0.65,
      roughness: 0.36,
    });
    for (const y of [1.27, 1.31, 1.35]) {
      const rib = new THREE.Mesh(
        new THREE.TorusGeometry(0.205, 0.009, 4, 12),
        ferruleRibMaterial,
      );
      rib.rotation.x = Math.PI / 2;
      rib.position.y = y;
      pencil.add(rib);
    }

    const orbit = new THREE.Mesh(
      new THREE.TorusGeometry(1.16, 0.014, 6, 72),
      new THREE.MeshStandardMaterial({
        color: 0xee7066,
        roughness: 0.55,
        transparent: true,
        opacity: 0.8,
      }),
    );
    orbit.rotation.set(1.05, 0.1, -0.25);
    orbit.position.z = -0.25;
    scene.add(orbit);

    const sparkles = new THREE.Group();
    const sparkleMaterial = new THREE.MeshStandardMaterial({
      color: 0xee7066,
      roughness: 0.6,
    });
    for (const [x, y, z] of [[-1.22, 0.78, 0.1], [1.18, -0.62, 0.25], [0.86, 1.05, -0.2]]) {
      const sparkle = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.075, 0),
        sparkleMaterial,
      );
      sparkle.position.set(x, y, z);
      sparkles.add(sparkle);
    }
    scene.add(sparkles);

    const resize = () => {
      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    let frame = 0;
    let lastFrame = 0;
    let isVisible = true;
    let pointerX = 0;
    let pointerY = 0;
    const renderFrame = (time: number) => {
      if (!isVisible) return;
      frame = window.requestAnimationFrame(renderFrame);
      if (time - lastFrame < 1000 / 30) return;
      lastFrame = time;

      const seconds = time / 1000;
      pencil.position.y = Math.sin(seconds * 1.2) * 0.06;
      pencil.rotation.x = pointerY * 0.18 + Math.sin(seconds * 0.45) * 0.025;
      pencil.rotation.y = pointerX * 0.2 + Math.sin(seconds * 0.6) * 0.08;
      orbit.rotation.z = -0.25 + seconds * 0.04;
      sparkles.rotation.y = -seconds * 0.12;
      renderer.render(scene, camera);
    };
    const startRendering = () => {
      if (!frame) frame = window.requestAnimationFrame(renderFrame);
    };
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) {
        startRendering();
      } else {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
    });
    visibilityObserver.observe(container);

    const updatePointer = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const bounds = container.getBoundingClientRect();
      pointerX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      pointerY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    };
    const resetPointer = () => {
      pointerX = 0;
      pointerY = 0;
    };
    container.addEventListener("pointermove", updatePointer);
    container.addEventListener("pointerleave", resetPointer);
    startRendering();

    return () => {
      window.cancelAnimationFrame(frame);
      visibilityObserver.disconnect();
      resizeObserver.disconnect();
      container.removeEventListener("pointermove", updatePointer);
      container.removeEventListener("pointerleave", resetPointer);
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];
        materials.forEach((material) => material.dispose());
      });
      renderer.dispose();
      renderer.domElement.remove();
      if (fallback) fallback.hidden = false;
    };
  }, []);

  return (
    <div className="relative h-[300px] w-full max-w-[350px]" ref={containerRef} aria-hidden="true">
      <span className="absolute inset-0 grid place-items-center font-serif text-[220px] leading-none text-[#ee7066] [transform:rotate(-24deg)]">
        ✎
      </span>
    </div>
  );
}
