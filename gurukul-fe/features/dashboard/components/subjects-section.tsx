"use client";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useEffect } from "react";

const subjectMarks = ["∑", "✦", "◉", "A", "⌁"];
const subjectColors = [
  "bg-[#f7e7a9]",
  "bg-[#f8d5cf]",
  "bg-[#dce8dc]",
  "bg-[#e4ddf0]",
];

export function SubjectsSection({
  subjects,
  selectedSubject,
  showAllSubjects,
  onSelectSubject,
  onToggleAll,
}: {
  subjects: string[];
  selectedSubject: string;
  showAllSubjects: boolean;
  onSelectSubject: (subject: string) => void;
  onToggleAll: () => void;
}) {
  const [subjectListRef, enableSubjectAnimations] = useAutoAnimate<HTMLDivElement>();

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateAnimations = () => enableSubjectAnimations(!motionPreference.matches);
    updateAnimations();
    motionPreference.addEventListener("change", updateAnimations);
    return () => motionPreference.removeEventListener("change", updateAnimations);
  }, [enableSubjectAnimations]);

  const visibleSubjects = showAllSubjects ? subjects : subjects.slice(0, 4);

  return (
    <section className="home-reveal min-w-0 py-1" id="subjects">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="m-0 text-[10px] font-extrabold tracking-[0.18em] text-[#625e54]">A FEW OF YOUR FAVORITES</p>
          <h2 className="mb-0 mt-2 font-serif text-[27px] font-bold tracking-[-0.05em] sm:text-[34px]">
            Choose your next <span className="text-[#ee5d58] italic">aha!</span>
          </h2>
        </div>
        {subjects.length > 4 && (
          <button
            className="shrink-0 cursor-pointer border-0 bg-transparent text-xs font-bold text-[#292722] underline decoration-[#ee5d58] underline-offset-4"
            type="button"
            aria-expanded={showAllSubjects}
            onClick={onToggleAll}
          >
            {showAllSubjects ? "Show fewer" : "See all"}
          </button>
        )}
      </div>

      {subjects.length ? (
        <div className="grid grid-cols-1 gap-3 min-[441px]:grid-cols-2" ref={subjectListRef}>
          {visibleSubjects.map((subject, index) => (
            <button
              className={`group relative flex min-h-[88px] cursor-pointer items-center gap-3 border border-[#302d29] px-3.5 py-3 text-left text-[#292722] shadow-[3px_4px_0_#e7e2d7] transition duration-200 hover:-translate-y-0.5 hover:-rotate-[0.4deg] hover:bg-[#fffdf6] hover:shadow-[4px_5px_0_#ee5d58] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ee5d58] motion-reduce:transition-none ${
                selectedSubject === subject
                  ? "border-[1.5px] bg-[#fff9e5] shadow-[3px_4px_0_#f2c94c]"
                  : "bg-[#fffefa]"
              }`}
              key={`${subject}-${index}`}
              type="button"
              aria-pressed={selectedSubject === subject}
              onClick={() => onSelectSubject(subject)}
            >
              <span className={`grid size-[43px] shrink-0 place-items-center rounded-full border border-[#292722] font-serif text-[21px] ${subjectColors[index % subjectColors.length]}`} aria-hidden="true">
                {subjectMarks[index % subjectMarks.length]}
              </span>
              <span className="grid min-w-0 gap-1">
                <strong className="truncate font-serif text-base">{subject}</strong>
                <small className="text-[10px] text-[#777267]">A favorite of yours</small>
              </span>
              <span className="ml-auto text-[17px] text-[#ee5d58]" aria-hidden="true">↗</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex min-h-[108px] items-center gap-4 border border-dashed border-[#aaa397] bg-[#fffefa] p-5 text-[13px] leading-relaxed text-[#625e54]">
          <span className="text-[28px] text-[#ee5d58]" aria-hidden="true">✎</span>
          <p className="m-0">Your favorite subjects will appear here once they’re added to your profile.</p>
        </div>
      )}
    </section>
  );
}
