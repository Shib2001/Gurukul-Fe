"use client";

import Link from "next/link";
import { FormEvent, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  clearPasswordResetToken,
  confirmPasswordReset,
  clearDevelopmentCode,
  getPasswordResetToken,
  getDevelopmentCode,
  loginStudent,
  registerStudent,
  requestPasswordReset,
  resendVerificationCode,
  saveAuthSession,
  saveDevelopmentCode,
  savePasswordResetToken,
  verifyEmail,
  verifyPasswordReset,
} from "@/lib/auth-api";
import { OtpCodeInput } from "./otp-code-input";

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
  type: "email" | "password" | "text" | "date" | "tel" | "number";
  placeholder: string;
  autoComplete: string;
  inputMode?: "numeric" | "tel";
  maxLength?: number;
  minLength?: number;
  max?: string;
  min?: string;
  pattern?: string;
  hint?: string;
};

const pageContent: Record<
  AuthMode,
  { eyebrow: string; title: string; highlight?: string; description: string; button: string; fields: Field[] }
> = {
  login: {
    eyebrow: "WELCOME BACK",
    title: "Pick up where",
    highlight: "you left off.",
    description: "Sign in with your email, roll number, or display name.",
    button: "Sign in",
    fields: [
      { id: "identifier", label: "Email, roll number, or name", type: "text", placeholder: "you@example.com", autoComplete: "username" },
      { id: "password", label: "Password", type: "password", placeholder: "Your password", autoComplete: "current-password", maxLength: 128 },
    ],
  },
  register: {
    eyebrow: "LET'S GET STARTED",
    title: "A fresh page,",
    highlight: "just for you.",
    description: "Create your student account and make learning your own.",
    button: "Create account",
    fields: [
      { id: "display_name", label: "Your name", type: "text", placeholder: "How should we call you?", autoComplete: "name", maxLength: 120 },
      { id: "email", label: "Email address", type: "email", placeholder: "you@example.com", autoComplete: "email" },
      { id: "date_of_birth", label: "Date of birth", type: "date", placeholder: "", autoComplete: "bday", max: latestBirthDate() },
      { id: "grade_level", label: "Grade level (1–10)", type: "number", placeholder: "e.g. 8", autoComplete: "off", min: "1", max: "10" },
      { id: "phone_number", label: "Phone number", type: "tel", placeholder: "+91 9876543210", autoComplete: "tel", inputMode: "tel" },
      { id: "password", label: "Create a password", type: "password", placeholder: "8 to 128 characters", autoComplete: "new-password", minLength: 8, maxLength: 128 },
      { id: "liked_subjects", label: "Subjects you like", type: "text", placeholder: "Mathematics, Science", autoComplete: "off", hint: "Separate subjects with commas." },
    ],
  },
  "verify-email": {
    eyebrow: "ONE QUICK CHECK",
    title: "Check your",
    highlight: "inbox.",
    description: "We’ll send a fresh six-digit verification code to your email or roll number.",
    button: "Resend verification code",
    fields: [
      { id: "identifier", label: "Email address or roll number", type: "text", placeholder: "you@example.com", autoComplete: "username" },
    ],
  },
  "forgot-password": {
    eyebrow: "IT HAPPENS",
    title: "Let’s get you",
    highlight: "back in.",
    description: "Enter your email or roll number and we’ll send a password-reset code.",
    button: "Send reset code",
    fields: [
      { id: "identifier", label: "Email address or roll number", type: "text", placeholder: "you@example.com", autoComplete: "username" },
    ],
  },
  "verify-otp": {
    eyebrow: "ALMOST THERE",
    title: "A little code,",
    highlight: "then you’re in.",
    description: "Enter the six-digit code from your email to activate your account.",
    button: "Verify email",
    fields: [
      { id: "identifier", label: "Email address or roll number", type: "text", placeholder: "you@example.com", autoComplete: "username" },
      { id: "code", label: "6-digit verification code", type: "text", placeholder: "000000", autoComplete: "one-time-code", inputMode: "numeric", maxLength: 6, minLength: 6, pattern: "[0-9]{6}" },
    ],
  },
  "reset-password": {
    eyebrow: "A CLEAN SLATE",
    title: "Choose a",
    highlight: "new password.",
    description: "Choose a new password between 8 and 128 characters.",
    button: "Update password",
    fields: [
      { id: "new_password", label: "New password", type: "password", placeholder: "8 to 128 characters", autoComplete: "new-password", minLength: 8, maxLength: 128 },
      { id: "confirm_password", label: "Confirm new password", type: "password", placeholder: "Type it one more time", autoComplete: "new-password", minLength: 8, maxLength: 128 },
    ],
  },
};

function latestBirthDate() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

function subscribeToLocation(callback: () => void) {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
}

function subscribeToDevelopmentCode(callback: () => void) {
  window.addEventListener("auth-development-code", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("auth-development-code", callback);
    window.removeEventListener("storage", callback);
  };
}

function getLocationSearch() {
  return window.location.search;
}

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [identifierOverride, setIdentifierOverride] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpCode, setOtpCode] = useState<string[]>(() => Array(6).fill(""));
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const search = useSyncExternalStore(subscribeToLocation, getLocationSearch, () => "");
  const developmentCode = useSyncExternalStore(
    subscribeToDevelopmentCode,
    getDevelopmentCode,
    () => "",
  );
  const searchParams = new URLSearchParams(search);
  const identifier = identifierOverride ?? searchParams.get("identifier") ?? "";
  const isResetFlow = searchParams.get("flow") === "reset";
  const passwordResetSuccess = mode === "login" && searchParams.get("passwordReset") === "success";

  const content =
    mode === "verify-otp" && isResetFlow
      ? {
          ...pageContent["verify-otp"],
          eyebrow: "PASSWORD RESET",
          title: "Verify your",
          highlight: "reset code.",
          description: "Enter the six-digit code sent to your registered email.",
          button: "Verify reset code",
        }
      : pageContent[mode];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setError("");
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);

    try {
      if (mode === "register") {
        const subjects = String(formData.get("liked_subjects"))
          .split(/[,\n]/)
          .map((subject) => subject.trim())
          .filter(Boolean);
        const email = String(formData.get("email")).trim();
        const result = await registerStudent({
          display_name: String(formData.get("display_name")).trim(),
          email,
          password: String(formData.get("password")),
          date_of_birth: String(formData.get("date_of_birth")),
          grade_level: Number(formData.get("grade_level")),
          liked_subjects: subjects,
          phone_number: String(formData.get("phone_number")).trim(),
        });
        saveDevelopmentCode(result.verification_code);
        router.push(`/verify-otp?identifier=${encodeURIComponent(email)}`);
        return;
      }

      if (mode === "login") {
        const session = await loginStudent({
          identifier: String(formData.get("identifier")).trim(),
          password: String(formData.get("password")),
        });
        saveAuthSession(session, formData.get("remember") === "on");
        router.push("/");
        return;
      }

      if (mode === "verify-email") {
        const value = String(formData.get("identifier")).trim();
        const result = await resendVerificationCode({ identifier: value });
        saveDevelopmentCode(result.verification_code);
        router.push(`/verify-otp?identifier=${encodeURIComponent(value)}`);
        return;
      }

      if (mode === "forgot-password") {
        const value = String(formData.get("identifier")).trim();
        const result = await requestPasswordReset({ identifier: value });
        saveDevelopmentCode(result.otp_code);
        router.push(`/verify-otp?flow=reset&identifier=${encodeURIComponent(value)}`);
        return;
      }

      if (mode === "verify-otp") {
        const value = String(formData.get("identifier")).trim();
        if (otpCode.some((digit) => !digit)) {
          setError("Enter all six digits of the code.");
          return;
        }
        const code = otpCode.join("");
        if (isResetFlow) {
          const result = await verifyPasswordReset({ identifier: value, code });
          clearDevelopmentCode();
          savePasswordResetToken(result.reset_token);
          router.push("/reset-password");
        } else {
          const session = await verifyEmail({ identifier: value, code });
          clearDevelopmentCode();
          saveAuthSession(session);
          router.push("/");
        }
        return;
      }

      if (mode === "reset-password") {
        const password = String(formData.get("new_password"));
        if (password !== formData.get("confirm_password")) {
          setError("Those passwords don’t match yet. Give it another try.");
          return;
        }
        const resetToken = getPasswordResetToken();
        if (!resetToken) {
          setError("Your reset session has expired. Request a new password-reset code.");
          return;
        }
        await confirmPasswordReset({
          reset_token: resetToken,
          new_password: password,
        });
        clearPasswordResetToken();
        router.replace("/login?passwordReset=success");
        return;
      }
    } catch (submitError) {
      setError(errorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function resendCode() {
    setNotice("");
    setError("");
    try {
      if (!identifier.trim()) {
        setError("Enter your email address or roll number first.");
        return;
      }
      if (isResetFlow) {
        const result = await requestPasswordReset({ identifier: identifier.trim() });
        saveDevelopmentCode(result.otp_code);
        setNotice("If the account exists, a new password-reset code has been sent.");
      } else {
        const result = await resendVerificationCode({ identifier: identifier.trim() });
        saveDevelopmentCode(result.verification_code);
        setNotice("If the account is awaiting verification, a new code has been sent.");
      }
    } catch (resendError) {
      setError(errorMessage(resendError));
    }
  }

  return (
    <div className={`auth-card ${mode === "register" ? "auth-card-register" : ""}`}>
      <div className="auth-kicker"><span aria-hidden="true">✳</span> {content.eyebrow}</div>
      <h2 className="auth-title">
        {content.title} <span>{content.highlight}</span>
      </h2>
      <p className="auth-description">{content.description}</p>
      {passwordResetSuccess && (
        <p className="form-notice" role="status">
          Your password has been reset. Sign in with your new password.
        </p>
      )}

      <form
        className={`auth-form ${mode === "register" ? "auth-form-register" : ""}`}
        onSubmit={handleSubmit}
      >
        {content.fields.map((field) => {
          if (field.id === "code") {
            return (
              <div className="auth-field auth-field-code" key={field.id}>
                <label htmlFor="otp-digit-0">{field.label}</label>
                <OtpCodeInput value={otpCode} onChange={setOtpCode} />
              </div>
            );
          }

          const isPassword = field.type === "password";
          return (
            <div
              className={`auth-field ${field.id === "liked_subjects" ? "auth-field-wide" : ""}`}
              key={field.id}
            >
              <label htmlFor={field.id}>{field.label}</label>
              {isPassword ? (
                <div className="auth-password-input">
                  <input
                    id={field.id}
                    name={field.id}
                    type={visiblePasswords[field.id] ? "text" : "password"}
                    placeholder={field.placeholder}
                    autoComplete={field.autoComplete}
                    maxLength={field.maxLength}
                    minLength={field.minLength}
                    required
                  />
                  <button
                    className="password-visibility-toggle"
                    type="button"
                    aria-label={visiblePasswords[field.id] ? "Hide password" : "Show password"}
                    aria-pressed={Boolean(visiblePasswords[field.id])}
                    onClick={() =>
                      setVisiblePasswords((current) => ({
                        ...current,
                        [field.id]: !current[field.id],
                      }))
                    }
                  >
                    {visiblePasswords[field.id] ? (
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.2A10.7 10.7 0 0112 5c5.2 0 8.6 4.7 9.5 6.2a1.5 1.5 0 010 1.6 15.4 15.4 0 01-3.1 3.5M6.2 6.2a16.2 16.2 0 00-3.7 5 1.5 1.5 0 000 1.6C3.4 14.3 6.8 19 12 19c.9 0 1.8-.2 2.6-.5" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M2.5 12s3.4-7 9.5-7 9.5 7 9.5 7-3.4 7-9.5 7-9.5-7-9.5-7z" />
                        <circle cx="12" cy="12" r="2.5" />
                      </svg>
                    )}
                  </button>
                </div>
              ) : (
                <input
                  id={field.id}
                  name={field.id}
                  type={field.type}
                  placeholder={field.placeholder}
                  autoComplete={field.autoComplete}
                  inputMode={field.inputMode}
                  maxLength={field.maxLength}
                  minLength={field.minLength}
                  min={field.min}
                  max={field.max}
                  pattern={field.pattern}
                  value={field.id === "identifier" ? identifier : undefined}
                  onChange={field.id === "identifier" ? (event) => setIdentifierOverride(event.target.value) : undefined}
                  data-hover-tilt="2.5"
                  data-hover-depth="6"
                  required
                />
              )}
              {field.hint && <small>{field.hint}</small>}
            </div>
          );
        })}

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

        <button className="auth-submit" type="submit" disabled={isSubmitting} data-hover-tilt="4" data-hover-depth="12">
          <span>{isSubmitting ? "Please wait..." : content.button}</span>
          <span className="button-arrow" aria-hidden="true">↗</span>
        </button>
        {mode === "verify-otp" && (
          <button className="auth-resend" type="button" onClick={resendCode}>
            Resend code
          </button>
        )}
        {mode === "verify-otp" && developmentCode && (
          <p className="form-notice" role="status">
            Development code: <strong>{developmentCode}</strong>
          </p>
        )}
        {error && <p className="form-notice" role="alert">{error}</p>}
        {notice && <p className="form-notice" role="status">{notice}</p>}
      </form>

      <p className="auth-form-footer">
        {mode === "login" && <>New around here? <Link href="/register">Create an account <span aria-hidden="true">↗</span></Link></>}
        {mode === "register" && <>Already have an account? <Link href="/login">Sign in</Link><span className="auth-secondary-link">Have a verification code? <Link href="/verify-otp">Enter it here</Link></span></>}
        {mode === "verify-email" && <>Have a code instead? <Link href="/verify-otp">Verify your email</Link><span className="auth-secondary-link">Changed your mind? <Link href="/login">Back to sign in</Link></span></>}
        {mode === "forgot-password" && <>Remembered it? <Link href="/login">Back to sign in</Link></>}
        {mode === "verify-otp" && <>{isResetFlow ? <>Need another reset code? <Link href="/forgot-password">Request another</Link></> : <>Need a fresh code? <Link href="/verify-email">Resend verification</Link></>}<span className="auth-secondary-link">Back to <Link href="/login">sign in</Link></span></>}
        {mode === "reset-password" && <>Password remembered? <Link href="/login">Back to sign in</Link></>}
      </p>
      <div className="form-doodle" aria-hidden="true">made with a little ✳</div>
    </div>
  );
}
