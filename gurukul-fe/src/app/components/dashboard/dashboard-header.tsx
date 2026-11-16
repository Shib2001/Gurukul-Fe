import Link from "next/link";
import { BrandLink } from "@/app/components/ui/brand-link";
import type { Student } from "@/services/auth-service";

const navigationItems = [
  { label: "My desk", href: "/dashboard#overview", activePage: "dashboard" },
  { label: "My subjects", href: "/dashboard#subjects", activePage: null },
  { label: "Study note", href: "/dashboard#study-note", activePage: null },
] as const;

type DashboardPage = "dashboard" | "profile";

type DashboardHeaderProps = {
  student: Student;
  isSigningOut: boolean;
  onSignOut: () => void;
  activePage?: DashboardPage;
};

function VoiceClassroomLabel() {
  return (
    <div className="hidden items-center gap-2.5 border-l border-[#d5d0c5] pl-4 lg:flex">
      <span className="grid size-9 shrink-0 place-items-center rounded-full border border-[#302d29] bg-[#f8d5cf] text-[#292722]" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" className="size-[18px]" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="3" width="6" height="12" rx="3" />
          <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21m-4 0h8" />
        </svg>
      </span>
      <span className="grid gap-0.5">
        <span className="text-[9px] font-extrabold tracking-[0.14em] text-[#292722]">AI VOICE CLASSROOM</span>
        <span className="text-[10px] text-[#625e54]">Subject teachers, ready to listen.</span>
      </span>
    </div>
  );
}

export function DashboardHeader({
  student,
  isSigningOut,
  onSignOut,
  activePage = "dashboard",
}: DashboardHeaderProps) {
  const firstName = student.display_name.trim().split(/\s+/)[0] || "learner";
  const avatarInitial = firstName.charAt(0).toUpperCase();

  return (
    <header className="relative z-10 w-full border-b-[1.5px] border-[#302d29] bg-[#fbfaf6]/95 backdrop-blur-md">
      <div className="mx-auto flex min-h-[78px] w-full max-w-[1244px] flex-wrap items-center justify-between gap-x-5 gap-y-2 px-4 py-3 sm:px-8 md:flex-nowrap md:py-0">
        <div className="flex min-w-0 items-center gap-4">
          <BrandLink
            className="grid w-[148px] shrink-0 content-center gap-0.5 no-underline [&>span]:whitespace-nowrap [&>span]:text-[9px] [&>span]:font-extrabold [&>span]:tracking-[0.13em] [&>span]:text-[#625e54]"
            imageClassName="h-[50px] w-[148px] object-cover object-center"
            href="/dashboard"
            label="Gurukul.ai student dashboard"
            width={148}
            height={50}
            sizes="148px"
            caption="SCHOOL VOICE TUTORS"
            priority
          />
          <VoiceClassroomLabel />
        </div>

        <nav
          className="order-3 flex w-full items-center justify-center gap-1 border-t border-[#e7e1d6] pt-2 md:order-none md:w-auto md:shrink-0 md:border-0 md:pt-0"
          aria-label="Student navigation"
        >
          {navigationItems.map((item) => {
            const current = item.activePage === activePage;
            return (
              <Link
                className={`inline-flex min-h-9 items-center whitespace-nowrap rounded-full px-3 text-[11px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ee5d58] sm:text-xs ${
                  current
                    ? "bg-[#f2c94c] font-bold text-[#292722] shadow-[2px_2px_0_#292722]"
                    : "font-semibold text-[#625e54] hover:bg-[#fff0b8] hover:text-[#292722]"
                }`}
                href={item.href}
                aria-current={current ? "page" : undefined}
                key={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          <Link
            className="group inline-flex min-h-9 items-center gap-2 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ee5d58]"
            href="/dashboard/profile"
            aria-label="My profile"
            aria-current={activePage === "profile" ? "page" : undefined}
          >
            <span
              className="grid size-[34px] shrink-0 place-items-center rounded-full border-[1.5px] border-[#292722] bg-[#f2c94c] font-serif text-lg font-bold shadow-[2px_2px_0_#292722] transition-transform group-hover:-translate-y-0.5 md:size-[38px]"
              aria-hidden="true"
            >
              {avatarInitial}
            </span>
            <span className="sr-only max-w-[100px] truncate text-xs font-bold group-hover:text-[#ee5d58] sm:not-sr-only">
              {firstName}
            </span>
          </Link>
          <span className="hidden text-[10px] text-[#777267] lg:inline">
            {student.grade_level ? `Grade ${student.grade_level}` : "Student"}
          </span>
          <span className="hidden h-6 w-px bg-[#d5d0c5] sm:inline" aria-hidden="true" />
          <button
            className="inline-flex min-h-9 cursor-pointer items-center rounded-full border border-[#d5d0c5] bg-[#fffefa] px-3 text-[11px] font-bold text-[#625e54] transition-colors hover:border-[#ee5d58] hover:text-[#292722] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ee5d58] disabled:cursor-wait disabled:opacity-65 sm:text-xs"
            type="button"
            onClick={onSignOut}
            disabled={isSigningOut}
          >
            {isSigningOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </div>
    </header>
  );
}
