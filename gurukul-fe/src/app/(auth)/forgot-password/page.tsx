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
import { requestPasswordReset, saveDevelopmentCode } from "@/services/auth-service";
import { getErrorMessage } from "@/utils/get-error-message";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const identifier = String(new FormData(event.currentTarget).get("identifier")).trim();
    try {
      const result = await requestPasswordReset({ identifier });
      saveDevelopmentCode(result.otp_code);
      router.push(`/verify-otp?flow=reset&identifier=${encodeURIComponent(identifier)}`);
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Something went wrong. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthPageFrame
      eyebrow="IT HAPPENS"
      title="Let’s get you"
      highlight="back in."
      description="Enter your email or roll number and we’ll send a password-reset code."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <AuthTextField
          id="identifier"
          label="Email address or roll number"
          placeholder="you@example.com"
          autoComplete="username"
        />
        <AuthSubmitButton label="Send reset code" isSubmitting={isSubmitting} />
        <AuthMessage message={error} role="alert" />
      </form>
      <p className="auth-form-footer">
        Remembered it? <Link href="/login">Back to sign in</Link>
      </p>
    </AuthPageFrame>
  );
}
