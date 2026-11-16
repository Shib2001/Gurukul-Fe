"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import {
  AuthMessage,
  AuthPageFrame,
  AuthSubmitButton,
  AuthTextField,
} from "@/app/components/auth/auth-ui";
import { resendVerificationCode, saveDevelopmentCode } from "@/services/auth-service";
import { getErrorMessage } from "@/utils/get-error-message";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const identifier = String(new FormData(event.currentTarget).get("identifier")).trim();
    try {
      const result = await resendVerificationCode({ identifier });
      saveDevelopmentCode(result.verification_code);
      router.push(`/verify-otp?identifier=${encodeURIComponent(identifier)}`);
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Something went wrong. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthPageFrame
      eyebrow="ONE QUICK CHECK"
      title="Check your"
      highlight="inbox."
      description="We’ll send a fresh six-digit verification code to your email or roll number."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <AuthTextField
          id="identifier"
          label="Email address or roll number"
          placeholder="you@example.com"
          autoComplete="username"
        />
        <AuthSubmitButton label="Resend verification code" isSubmitting={isSubmitting} />
        <AuthMessage message={error} role="alert" />
      </form>
      <p className="auth-form-footer">
        Have a code instead? <Link href="/verify-otp">Verify your email</Link>
        <span className="auth-secondary-link">Changed your mind? <Link href="/login">Back to sign in</Link></span>
      </p>
    </AuthPageFrame>
  );
}
