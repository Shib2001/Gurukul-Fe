"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import {
  AuthMessage,
  AuthPageFrame,
  AuthPasswordField,
  AuthSubmitButton,
} from "@/app/components/auth/auth-ui";
import {
  clearPasswordResetToken,
  confirmPasswordReset,
  getPasswordResetToken,
} from "@/services/auth-service";
import { getErrorMessage } from "@/utils/get-error-message";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("new_password"));
    if (password !== formData.get("confirm_password")) {
      setError("Those passwords don’t match yet. Give it another try.");
      setIsSubmitting(false);
      return;
    }

    const resetToken = getPasswordResetToken();
    if (!resetToken) {
      setError("Your reset session has expired. Request a new password-reset code.");
      setIsSubmitting(false);
      return;
    }

    try {
      await confirmPasswordReset({ reset_token: resetToken, new_password: password });
      clearPasswordResetToken();
      router.replace("/login?passwordReset=success");
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Something went wrong. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthPageFrame
      eyebrow="A CLEAN SLATE"
      title="Choose a"
      highlight="new password."
      description="Choose a new password between 8 and 128 characters."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <AuthPasswordField
          id="new_password"
          label="New password"
          placeholder="8 to 128 characters"
          autoComplete="new-password"
          minLength={8}
        />
        <AuthPasswordField
          id="confirm_password"
          label="Confirm new password"
          placeholder="Type it one more time"
          autoComplete="new-password"
          minLength={8}
        />
        <AuthSubmitButton label="Update password" isSubmitting={isSubmitting} />
        <AuthMessage message={error} role="alert" />
      </form>
      <p className="auth-form-footer">
        Password remembered? <Link href="/login">Back to sign in</Link>
      </p>
    </AuthPageFrame>
  );
}
