"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { OtpCodeInput } from "@/app/components/auth/otp-code-input";
import {
  AuthMessage,
  AuthPageFrame,
  AuthSubmitButton,
  AuthTextField,
} from "@/app/components/auth/auth-ui";
import { useAuthSearch, useDevelopmentCode } from "@/app/hooks/use-auth-location";
import {
  clearDevelopmentCode,
  requestPasswordReset,
  resendVerificationCode,
  saveAuthSession,
  saveDevelopmentCode,
  savePasswordResetToken,
  verifyEmail,
  verifyPasswordReset,
} from "@/services/auth-service";
import { getErrorMessage } from "@/utils/get-error-message";

export default function VerifyOtpPage() {
  const router = useRouter();
  const search = new URLSearchParams(useAuthSearch());
  const developmentCode = useDevelopmentCode();
  const isResetFlow = search.get("flow") === "reset";
  const [identifierOverride, setIdentifierOverride] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState<string[]>(() => Array(6).fill(""));
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const identifier = identifierOverride ?? search.get("identifier") ?? "";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const value = String(formData.get("identifier")).trim();
    if (otpCode.some((digit) => !digit)) {
      setError("Enter all six digits of the code.");
      setIsSubmitting(false);
      return;
    }

    try {
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
        router.push("/dashboard");
      }
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Something went wrong. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function resendCode() {
    setNotice("");
    setError("");
    if (!identifier.trim()) {
      setError("Enter your email address or roll number first.");
      return;
    }

    try {
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
      setError(getErrorMessage(resendError, "Something went wrong. Please try again."));
    }
  }

  const content = isResetFlow
    ? {
        eyebrow: "PASSWORD RESET",
        title: "Verify your",
        highlight: "reset code.",
        description: "Enter the six-digit code sent to your registered email.",
        button: "Verify reset code",
      }
    : {
        eyebrow: "ALMOST THERE",
        title: "A little code,",
        highlight: "then you’re in.",
        description: "Enter the six-digit code from your email to activate your account.",
        button: "Verify email",
      };

  return (
    <AuthPageFrame {...content}>
      <form className="auth-form" onSubmit={handleSubmit}>
        <AuthTextField
          id="identifier"
          label="Email address or roll number"
          placeholder="you@example.com"
          autoComplete="username"
          value={identifier}
          onChange={(event) => setIdentifierOverride(event.target.value)}
        />
        <div className="auth-field auth-field-code">
          <label htmlFor="otp-digit-0">6-digit verification code</label>
          <OtpCodeInput value={otpCode} onChange={setOtpCode} />
        </div>
        <AuthSubmitButton label={content.button} isSubmitting={isSubmitting} />
        <button className="auth-resend" type="button" onClick={resendCode}>
          Resend code
        </button>
        {developmentCode && (
          <p className="form-notice" role="status">
            Development code: <strong>{developmentCode}</strong>
          </p>
        )}
        <AuthMessage message={error} role="alert" />
        <AuthMessage message={notice} role="status" />
      </form>
      <p className="auth-form-footer">
        {isResetFlow ? (
          <>Need another reset code? <Link href="/forgot-password">Request another</Link></>
        ) : (
          <>Need a fresh code? <Link href="/verify-email">Resend verification</Link></>
        )}
        <span className="auth-secondary-link">Back to <Link href="/login">sign in</Link></span>
      </p>
    </AuthPageFrame>
  );
}
