"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type AuthMode =
  | "login"
  | "register"
  | "verify-email"
  | "forgot-password"
  | "verify-otp"
  | "reset-password";

type Field = {
  id: string;
  label: string;
  type: "email" | "password" | "text";
  placeholder: string;
  autoComplete: string;
  inputMode?: "numeric";
  maxLength?: number;
  minLength?: number;
  pattern?: string;
};

const pageContent: Record<
  AuthMode,
  { eyebrow: string; title: string; highlight?: string; description: string; button: string; fields: Field[] }
> = {
  login: {
    eyebrow: "WELCOME BACK",
    title: "Pick up where",
    highlight: "you left off.",
    description: "Your next little breakthrough is waiting.",
    button: "Sign in",
    fields: [
      { id: "email", label: "Email address", type: "email", placeholder: "you@example.com", autoComplete: "email" },
      { id: "password", label: "Password", type: "password", placeholder: "Your password", autoComplete: "current-password" },
    ],
  },
  register: {
    eyebrow: "LET'S GET STARTED",
    title: "A fresh page,",
    highlight: "just for you.",
    description: "Create your account and make learning your own.",
    button: "Create account",
    fields: [
      { id: "name", label: "Your name", type: "text", placeholder: "How should we call you?", autoComplete: "name" },
      { id: "email", label: "Email address", type: "email", placeholder: "you@example.com", autoComplete: "email" },
      { id: "password", label: "Create a password", type: "password", placeholder: "At least 8 characters", autoComplete: "new-password", minLength: 8 },
    ],
  },
  "verify-email": {
    eyebrow: "ONE QUICK CHECK",
    title: "Check your",
    highlight: "inbox.",
    description: "Enter the email address you used to get started. A verification link can be sent once auth is connected.",
    button: "Send verification link",
    fields: [
      { id: "email", label: "Email address", type: "email", placeholder: "you@example.com", autoComplete: "email" },
    ],
  },
  "forgot-password": {
    eyebrow: "IT HAPPENS",
    title: "Let’s get you",
    highlight: "back in.",
    description: "Enter your email and we’ll help you reset your password.",
    button: "Send reset code",
    fields: [
      { id: "email", label: "Email address", type: "email", placeholder: "you@example.com", autoComplete: "email" },
    ],
  },
  "verify-otp": {
    eyebrow: "ALMOST THERE",
    title: "A little code,",
    highlight: "then you’re in.",
    description: "Enter the 6-digit code from your email to continue.",
    button: "Verify code",
    fields: [
      { id: "email", label: "Email address", type: "email", placeholder: "you@example.com", autoComplete: "email" },
      { id: "code", label: "6-digit verification code", type: "text", placeholder: "000000", autoComplete: "one-time-code", inputMode: "numeric", maxLength: 6, pattern: "[0-9]{6}" },
    ],
  },
  "reset-password": {
    eyebrow: "A CLEAN SLATE",
    title: "Choose a",
    highlight: "new password.",
    description: "Make it something only you know. Eight characters or more works best.",
    button: "Update password",
    fields: [
      { id: "password", label: "New password", type: "password", placeholder: "At least 8 characters", autoComplete: "new-password", minLength: 8 },
      { id: "confirm-password", label: "Confirm new password", type: "password", placeholder: "Type it one more time", autoComplete: "new-password", minLength: 8 },
    ],
  },
};

const footers: Record<AuthMode, React.ReactNode> = {
  login: (
    <>
      New around here? <Link href="/register">Create an account <span aria-hidden="true">↗</span></Link>
    </>
  ),
  register: (
    <>
      Already have an account? <Link href="/login">Sign in</Link>
      <span className="auth-secondary-link">Have a verification code? <Link href="/verify-otp">Enter it here</Link></span>
    </>
  ),
  "verify-email": (
    <>
      Have a code instead? <Link href="/verify-otp">Verify your email</Link>
      <span className="auth-secondary-link">Changed your mind? <Link href="/login">Back to sign in</Link></span>
    </>
  ),
  "forgot-password": (
    <>
      Remembered it? <Link href="/login">Back to sign in</Link>
      <span className="auth-secondary-link">Already have a reset code? <Link href="/verify-otp">Enter it here</Link></span>
    </>
  ),
  "verify-otp": (
    <>
      Need a fresh code? <Link href="/forgot-password">Request another</Link>
      <span className="auth-secondary-link">Resetting your password? <Link href="/reset-password">Continue</Link></span>
    </>
  ),
  "reset-password": (
    <>
      Password remembered? <Link href="/login">Back to sign in</Link>
    </>
  ),
};

export function AuthForm({ mode }: { mode: AuthMode }) {
  const content = pageContent[mode];
  const [notice, setNotice] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    if (
      mode === "reset-password" &&
      formData.get("password") !== formData.get("confirm-password")
    ) {
      setNotice("Those passwords don’t match yet. Give it another try.");
      return;
    }

    setNotice("Authentication isn’t connected yet, so nothing was sent. Connect the auth API to continue.");
  }

  return (
    <div className="auth-card">
      <div className="auth-kicker"><span aria-hidden="true">✳</span> {content.eyebrow}</div>
      <h2 className="auth-title">
        {content.title} <span>{content.highlight}</span>
      </h2>
      <p className="auth-description">{content.description}</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        {content.fields.map((field) => (
          <div className={`auth-field ${field.id === "code" ? "auth-field-code" : ""}`} key={field.id}>
            <label htmlFor={field.id}>{field.label}</label>
            <input
              id={field.id}
              name={field.id}
              type={field.type}
              placeholder={field.placeholder}
              autoComplete={field.autoComplete}
              inputMode={field.inputMode}
              maxLength={field.maxLength}
              minLength={field.minLength}
              pattern={field.pattern}
              data-hover-tilt="2.5"
              data-hover-depth="6"
              required
            />
          </div>
        ))}

        {mode === "login" && (
          <div className="form-utility">
            <label className="remember-me">
              <input type="checkbox" name="remember" />
              <span>Keep me signed in</span>
            </label>
            <Link href="/forgot-password">Forgot password?</Link>
          </div>
        )}

        {mode === "register" && (
          <label className="terms-check">
            <input type="checkbox" name="terms" required />
            <span>I agree to the Gurukul.ai Terms and Privacy Policy.</span>
          </label>
        )}

        <button className="auth-submit" type="submit" data-hover-tilt="4" data-hover-depth="12">
          <span>{content.button}</span>
          <span className="button-arrow" aria-hidden="true">↗</span>
        </button>
        {notice && <p className="form-notice" role="status">{notice}</p>}
      </form>

      <p className="auth-form-footer">{footers[mode]}</p>
      <div className="form-doodle" aria-hidden="true">made with a little ✳</div>
    </div>
  );
}
