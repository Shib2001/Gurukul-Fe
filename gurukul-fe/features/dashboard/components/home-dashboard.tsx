"use client";

import { useGSAP } from "@gsap/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useHomeDashboard } from "../hooks/use-home-dashboard";
import { DashboardFooter } from "./dashboard-footer";
import { DashboardHeader } from "./dashboard-header";
import { ProfileStats } from "./profile-stats";
import { SplashScreen } from "./splash-screen";
import { StudyNote } from "./study-note";
import { SubjectsSection } from "./subjects-section";
import { WelcomeHero } from "./welcome-hero";

gsap.registerPlugin(useGSAP);

const inkButton =
  "inline-flex min-h-[46px] items-center justify-between gap-6 border-[1.5px] border-[#292722] bg-[#292722] px-4 text-[13px] font-bold text-[#fffefa] no-underline shadow-[3px_4px_0_#ee5d58] transition duration-200 hover:-translate-y-px hover:bg-[#ee5d58] hover:shadow-[4px_5px_0_#292722] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ee5d58] motion-reduce:transition-none";

function getFirstName(displayName: string) {
  return displayName.trim().split(/\s+/)[0] || "learner";
}

export function HomeDashboard() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [showSplash, setShowSplash] = useState(true);
  const {
    student,
    isLoading,
    loadError,
    logoutError,
    isSigningOut,
    selectedSubject,
    setSelectedSubject,
    showAllSubjects,
    setShowAllSubjects,
    retry,
    signOut,
  } = useHomeDashboard();

  useGSAP(
    () => {
      if (showSplash || isLoading || loadError || !student) return;

      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".home-reveal", {
          y: 18,
          autoAlpha: 0,
          duration: 0.65,
          stagger: 0.08,
          ease: "power2.out",
        });
        gsap.to(".hero-note-sticker", {
          y: -7,
          rotation: 3,
          duration: 1.8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });
      return () => media.revert();
    },
    { scope: pageRef, dependencies: [showSplash, isLoading, loadError, student], revertOnUpdate: true },
  );

  useEffect(() => {
    if (!showSplash) return;
    const timer = window.setTimeout(() => setShowSplash(false), 2500);
    return () => window.clearTimeout(timer);
  }, [showSplash]);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (isLoading) {
    return (
      <main
        className="grid min-h-svh place-content-center justify-items-center bg-[#fbfaf6] [background-image:radial-gradient(#26231d_0.45px,transparent_0.45px)] [background-size:19px_19px] text-[#292722]"
        aria-live="polite"
      >
        <span className="animate-bounce font-serif text-[45px] text-[#ee5d58] motion-reduce:animate-none" aria-hidden="true">✎</span>
        <p className="mt-2 font-serif text-lg italic text-[#625e54]">Sharpening your pencils...</p>
      </main>
    );
  }

  if (loadError || !student) {
    return (
      <main className="grid min-h-svh place-content-center justify-items-center bg-[#fbfaf6] p-6 [background-image:radial-gradient(#26231d_0.45px,transparent_0.45px)] [background-size:19px_19px] text-[#292722]">
        <section
          className="relative w-full max-w-[430px] border-[1.5px] border-[#302d29] bg-[#fffefa] p-9 text-center shadow-[5px_6px_0_#292722]"
          role="alert"
        >
          <span className="text-[29px] text-[#ee5d58]" aria-hidden="true">✳</span>
          <p className="mt-3 text-[10px] font-extrabold tracking-[0.18em] text-[#625e54]">YOUR STUDY DESK</p>
          <h1 className="mt-3 font-serif text-[34px] font-bold leading-tight">We couldn’t open your notebook.</h1>
          <p className="my-4 text-[13px] leading-relaxed text-[#625e54]">{loadError || "Your student profile could not be loaded."}</p>
          <button className={inkButton} type="button" onClick={retry}>
            Try again <span aria-hidden="true">↗</span>
          </button>
          <Link className="mt-5 block text-xs font-bold text-[#292722] underline decoration-[#ee5d58] underline-offset-4" href="/login">
            Back to sign in
          </Link>
        </section>
      </main>
    );
  }

  const subjects = student.liked_subjects ?? [];
  const activeSubject = subjects.includes(selectedSubject) ? selectedSubject : subjects[0];
  const firstName = getFirstName(student.display_name);

  return (
    <div
      className="min-h-svh overflow-hidden bg-[#fbfaf6] [background-image:radial-gradient(#26231d_0.45px,transparent_0.45px)] [background-size:19px_19px] text-[#292722]"
      ref={pageRef}
    >
      <a className="fixed left-3 top-3 z-50 -translate-y-[160%] bg-[#292722] px-4 py-2.5 text-[#fffefa] focus:translate-y-0" href="#main-content">
        Skip to content
      </a>
      <DashboardHeader student={student} isSigningOut={isSigningOut} onSignOut={signOut} />

      <main className="mx-auto w-full max-w-[1244px] px-4 pt-6 sm:px-8 sm:pt-9" id="main-content">
        {logoutError && (
          <p className="mb-5 border-l-[3px] border-[#ee5d58] bg-[#fff3ef] px-4 py-3 text-[13px] text-[#5b332f]" role="alert">
            {logoutError} <Link className="ml-2 font-bold text-[#292722] underline" href="/login">Continue</Link>
          </p>
        )}
        <WelcomeHero firstName={firstName} gradeLevel={student.grade_level} />
        <ProfileStats
          gradeLevel={student.grade_level}
          subjectCount={subjects.length}
          rollNumber={student.roll_number}
        />
        <div className="mt-8 grid grid-cols-1 items-stretch gap-5 md:mt-9 md:grid-cols-[minmax(0,1.55fr)_minmax(250px,0.75fr)] md:gap-6">
          <SubjectsSection
            subjects={subjects}
            selectedSubject={activeSubject ?? ""}
            showAllSubjects={showAllSubjects}
            onSelectSubject={setSelectedSubject}
            onToggleAll={() => setShowAllSubjects((current) => !current)}
          />
          <StudyNote subject={activeSubject} />
        </div>
      </main>
      <DashboardFooter />
    </div>
  );
}
