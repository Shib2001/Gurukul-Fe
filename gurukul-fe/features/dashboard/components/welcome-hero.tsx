import dynamic from "next/dynamic";

const PencilScene = dynamic(() => import("./pencil-scene"), {
  ssr: false,
  loading: () => (
    <div className="relative h-[300px] w-full max-w-[350px]" aria-hidden="true">
      <span className="absolute inset-0 grid place-items-center font-serif text-[220px] leading-none text-[#ee7066] [transform:rotate(-24deg)]">
        ✎
      </span>
    </div>
  ),
});

export function WelcomeHero({
  firstName,
  gradeLevel,
}: {
  firstName: string;
  gradeLevel: string | null;
}) {
  return (
    <section
      className="home-reveal relative grid min-h-[342px] grid-cols-1 items-center overflow-hidden border-[1.5px] border-[#302d29] bg-[#f3f0e7] shadow-[5px_6px_0_#292722] [background-image:radial-gradient(#34312c_0.5px,transparent_0.5px)] [background-size:17px_17px] md:grid-cols-[minmax(0,1.13fr)_minmax(280px,0.87fr)]"
      id="overview"
    >
      <div className="relative z-10 px-6 pb-1 pt-9 sm:px-8 md:px-12 md:py-10 lg:px-16">
        <p className="m-0 text-[10px] font-extrabold tracking-[0.18em] text-[#625e54]">
          <span className="text-sm text-[#ee5d58]" aria-hidden="true">✳</span> YOUR LEARNING DESK
        </p>
        <h1 className="mb-3 mt-4 max-w-[580px] font-serif text-[clamp(42px,5.2vw,68px)] font-bold leading-[0.98] tracking-[-0.07em]">
          Small steps,
          <span className="block text-[#ee5d58] italic">big discoveries.</span>
        </h1>
        <p className="m-0 max-w-[415px] text-sm leading-[1.7] text-[#625e54]">
          Welcome back, {firstName}. Your next little “aha!” is just around the corner.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <a
            className="inline-flex min-h-[46px] items-center justify-between gap-6 border-[1.5px] border-[#292722] bg-[#292722] px-4 text-[13px] font-bold text-[#fffefa] no-underline shadow-[3px_4px_0_#ee5d58] transition duration-200 hover:-translate-y-px hover:bg-[#ee5d58] hover:shadow-[4px_5px_0_#292722] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ee5d58] motion-reduce:transition-none"
            href="#subjects"
          >
            Pick a subject <span aria-hidden="true">↗</span>
          </a>
          <span className="text-xs font-bold text-[#625e54]">
            {gradeLevel ? `Grade ${gradeLevel}` : "Your study space"}
          </span>
        </div>
      </div>

      <div
        className="relative isolate grid min-h-[240px] place-items-center md:min-h-[320px]"
        role="img"
        aria-label="A playful animated 3D pencil illustration"
      >
        <div className="absolute -z-10 aspect-square w-[205px] rounded-full border-[1.5px] border-[#292722] bg-[#f2c94c] shadow-[4px_5px_0_#292722] md:w-[min(72%,286px)]" />
        <PencilScene />
        <span className="hero-note-sticker absolute bottom-[19%] right-[5%] z-10 rotate-2 border-[1.5px] border-[#292722] bg-[#fffefa] px-3 py-2 font-serif text-[13px] italic text-[#292722] shadow-[3px_4px_0_#ee5d58] md:bottom-[22%] md:right-[8%]">
          ready, set, learn!
        </span>
        <span className="absolute right-[14%] top-[17%] rotate-12 text-[28px] text-[#ee5d58]" aria-hidden="true">✳</span>
        <span className="absolute bottom-[18%] left-[5%] -rotate-12 text-[40px] text-[#ee5d58]" aria-hidden="true">〰</span>
      </div>

      <span className="absolute right-3 top-0 -rotate-2 bg-[#ee7066] px-2.5 py-2 text-[9px] font-extrabold tracking-[0.14em] text-[#fffefa] sm:right-6">
        ✎ TODAY’S PAGE
      </span>
    </section>
  );
}
