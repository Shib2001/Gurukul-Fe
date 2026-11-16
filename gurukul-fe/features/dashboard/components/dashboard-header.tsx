import { BrandLink } from "@/components/ui/brand-link";
import { Student } from "@/lib/auth-api";

export function DashboardHeader({
  student,
  isSigningOut,
  onSignOut,
}: {
  student: Student;
  isSigningOut: boolean;
  onSignOut: () => void;
}) {
  const firstName = student.display_name.trim().split(/\s+/)[0] || "learner";

  return (
    <header className="mx-auto flex min-h-[88px] w-full max-w-[1244px] flex-wrap items-center justify-between gap-x-7 gap-y-2 border-b-[1.5px] border-[#302d29] px-4 py-3 sm:px-8 md:flex-nowrap md:py-0">
      <BrandLink
        className="grid w-[138px] shrink-0 content-center no-underline md:w-[164px]"
        imageClassName="h-auto w-[135px] object-contain object-left md:w-[155px]"
        href="/"
        label="Gurukul.ai study desk"
        caption="YOUR LEARNING DESK"
        priority
      />

      <nav className="order-3 flex w-full items-center justify-between gap-2 pt-1 md:order-none md:w-auto md:justify-start md:gap-8 md:pt-0" aria-label="Study desk">
        <a
          className="relative py-2 text-[10px] font-bold text-[#292722] after:absolute after:inset-x-0 after:bottom-px after:h-0.5 after:-rotate-1 after:bg-[#ee5d58] sm:text-xs md:text-[13px]"
          href="#overview"
          aria-current="page"
        >
          My desk
        </a>
        <a className="py-2 text-[10px] font-semibold text-[#625e54] transition-colors hover:text-[#292722] focus-visible:outline-2 focus-visible:outline-[#ee5d58] sm:text-xs md:text-[13px]" href="#subjects">
          My subjects
        </a>
        <a className="py-2 text-[10px] font-semibold text-[#625e54] transition-colors hover:text-[#292722] focus-visible:outline-2 focus-visible:outline-[#ee5d58] sm:text-xs md:text-[13px]" href="#study-note">
          A little inspiration
        </a>
      </nav>

      <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
        <span className="grid size-[33px] place-items-center rounded-full border-[1.5px] border-[#292722] bg-[#f2c94c] font-serif text-lg font-bold shadow-[2px_2px_0_#292722] md:size-[38px]">
          {student.display_name.trim().charAt(0).toUpperCase()}
        </span>
        <span className="hidden max-w-[90px] truncate text-[13px] font-bold sm:inline">{firstName}</span>
        <button
          className="cursor-pointer border-0 bg-transparent text-[11px] font-bold text-[#625e54] underline decoration-[#ee5d58] underline-offset-4 transition-colors hover:text-[#ee5d58] disabled:cursor-wait disabled:opacity-65 sm:text-xs"
          type="button"
          onClick={onSignOut}
          disabled={isSigningOut}
        >
          {isSigningOut ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </header>
  );
}
