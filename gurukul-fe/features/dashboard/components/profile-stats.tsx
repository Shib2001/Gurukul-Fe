export function ProfileStats({
  gradeLevel,
  subjectCount,
  rollNumber,
}: {
  gradeLevel: string | null;
  subjectCount: number;
  rollNumber: string;
}) {
  return (
    <section className="home-reveal mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-4" aria-label="Your student profile">
      <article className="flex min-h-[70px] items-center gap-3 border border-[#302d29] bg-[#fffefa] px-4 py-3 shadow-[3px_4px_0_#e7e2d7] sm:min-h-[87px] sm:px-5">
        <span className="grid size-[37px] shrink-0 place-items-center rounded-full border border-[#292722] bg-[#f7e7a9] font-serif text-xl" aria-hidden="true">✿</span>
        <div className="grid min-w-0 gap-1">
          <span className="text-[9px] font-extrabold tracking-[0.14em] text-[#777267]">YOUR GRADE</span>
          <strong className="truncate font-serif text-[19px]">{gradeLevel ?? "—"}</strong>
        </div>
      </article>
      <article className="flex min-h-[70px] items-center gap-3 border border-[#302d29] bg-[#fffefa] px-4 py-3 shadow-[3px_4px_0_#e7e2d7] sm:min-h-[87px] sm:px-5">
        <span className="grid size-[37px] shrink-0 place-items-center rounded-full border border-[#292722] bg-[#f8d5cf] font-serif text-xl" aria-hidden="true">✳</span>
        <div className="grid min-w-0 gap-1">
          <span className="text-[9px] font-extrabold tracking-[0.14em] text-[#777267]">SUBJECTS YOU LIKE</span>
          <strong className="truncate font-serif text-[19px]">{subjectCount}</strong>
        </div>
      </article>
      <article className="flex min-h-[70px] items-center gap-3 border border-[#302d29] bg-[#fffefa] px-4 py-3 shadow-[3px_4px_0_#e7e2d7] sm:min-h-[87px] sm:px-5">
        <span className="grid size-[37px] shrink-0 place-items-center rounded-full border border-[#292722] bg-[#dce8dc] font-serif text-xl" aria-hidden="true">#</span>
        <div className="grid min-w-0 gap-1">
          <span className="text-[9px] font-extrabold tracking-[0.14em] text-[#777267]">YOUR ROLL NUMBER</span>
          <strong className="truncate text-sm">{rollNumber}</strong>
        </div>
      </article>
    </section>
  );
}
