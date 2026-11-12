import Image from "next/image";
import Link from "next/link";
import { AuthHoverMotion } from "@/app/components/auth/auth-hover-motion";
import "./auth.css";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="auth-layout">
      <aside className="auth-art" aria-label="Learning at Gurukul.ai">
        <div className="art-topline">
          <Link className="art-brand" href="/login" aria-label="Gurukul.ai home" data-hover-tilt="3" data-hover-depth="6">
            <Image
              src="/Gurukul.ai (B-FONT).png"
              alt="Gurukul.ai"
              fill
              sizes="176px"
              priority
            />
          </Link>
          <span className="art-edition">A place to grow</span>
        </div>

        <div className="art-copy">
          <p className="eyebrow"><span aria-hidden="true">✳</span> YOUR NEXT CHAPTER</p>
          <h1 data-hover-tilt="4.5" data-hover-depth="9">
            A Gurukul
            <br />
            <span>powered by AI.</span>
          </h1>
          <p className="art-description">
            An AI study companion that explains tricky ideas, solves doubts,
            and helps every student grow.
          </p>
        </div>

        <div className="photo-collage" aria-label="Scenes from the classroom">
          <figure className="photo photo-feature" data-hover-tilt="7" data-hover-depth="12">
            <Image
              src="/Auth-1.avif"
              alt="Students celebrating a graduation"
              fill
              priority
              sizes="(max-width: 760px) 100vw, 45vw"
            />
            <figcaption>Little steps, big milestones</figcaption>
          </figure>
          <figure className="photo photo-classroom" data-hover-tilt="7" data-hover-depth="12">
            <Image
              src="/Auth-2.jpg"
              alt="A teacher writing on a classroom chalkboard"
              fill
              sizes="(max-width: 760px) 45vw, 18vw"
            />
          </figure>
          <figure className="photo photo-campus" data-hover-tilt="7" data-hover-depth="12">
            <Image
              src="/Auth-3.jpg"
              alt="Students walking across a leafy campus"
              fill
              sizes="(max-width: 760px) 35vw, 14vw"
            />
          </figure>
          <figure className="photo photo-student" data-hover-tilt="7" data-hover-depth="12">
            <Image
              src="/Auth-4.jpg"
              alt="A student ready to learn"
              fill
              sizes="(max-width: 760px) 35vw, 14vw"
            />
          </figure>
          <span className="doodle doodle-star" aria-hidden="true">✳</span>
          <span className="doodle doodle-arrow" aria-hidden="true">↗</span>
          <span className="collage-sticker" data-hover-tilt="4" data-hover-depth="8">
            <Image
              src="/Gurukul.ai (W-FONT).png"
              alt=""
              fill
              sizes="126px"
            />
          </span>
        </div>

        <div className="art-footer">
          <span>Curiosity looks good on you.</span>
          <span className="footer-squiggle" aria-hidden="true">～～～</span>
        </div>
      </aside>

      <section className="auth-panel" aria-label="Account access">
        <div className="mobile-brand">
          <Image
            src="/Gurukul.ai (B-FONT).png"
            alt="Gurukul.ai"
            fill
            sizes="152px"
            priority
          />
        </div>
        <div className="auth-form-area">{children}</div>
        <footer className="auth-legal">
          <span>Made for curious minds</span>
          <span>Secure student access</span>
        </footer>
      </section>
      <AuthHoverMotion />
    </main>
  );
}
