export function StudyNote({ subject }: { subject?: string }) {
  return (
    <aside
      className="home-reveal relative min-h-[240px] self-stretch border-[1.5px] border-[#302d29] bg-[#fff0b8] px-6 pb-6 pt-8 shadow-[4px_5px_0_#292722] [background-image:repeating-linear-gradient(to_bottom,transparent_0,transparent_30px,rgb(41_39_34_/_9%)_31px,transparent_32px)] md:rotate-[0.7deg]"
      id="study-note"
    >
      <span className="absolute -top-2.5 left-1/2 h-[22px] w-[76px] -translate-x-1/2 -rotate-3 bg-[#ee7066]/70" aria-hidden="true" />
      <p className="m-0 text-[10px] font-extrabold tracking-[0.18em] text-[#625e54]">A NOTE FOR TODAY</p>
      <h2 className="mb-2.5 mt-4 font-serif text-2xl font-bold leading-[1.13]">
        {subject ? `A little ${subject}` : "A little curiosity"} goes a long way.
      </h2>
      <p className="m-0 text-xs leading-[1.7] text-[#625e54]">
        You don’t have to know it all today. Just bring one good question and see where it takes you.
      </p>
      {subject && (
        <div className="mt-4 flex items-center gap-2 text-[11px]">
          <span className="grid size-[21px] place-items-center rounded-full border border-[#292722] bg-[#dce8dc]" aria-hidden="true">✓</span>
          <span>On your list: <strong>{subject}</strong></span>
        </div>
      )}
      <span className="mt-5 block text-right font-serif text-xs italic text-[#777267]">— your Gurukul study buddy</span>
    </aside>
  );
}
