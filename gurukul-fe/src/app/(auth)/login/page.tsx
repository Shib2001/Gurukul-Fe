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
  AuthTextField,
} from "@/app/components/auth/auth-ui";
import { useAuthSearch } from "@/app/hooks/use-auth-location";
import { loginStudent, saveAuthSession } from "@/services/auth-service";
import { getErrorMessage } from "@/utils/get-error-message";

export default function LoginPage() {
  const router = useRouter();
  const search = new URLSearchParams(useAuthSearch());
  const passwordResetSuccess = search.get("passwordReset") === "success";
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    try {
      const session = await loginStudent({
        identifier: String(formData.get("identifier")).trim(),
        password: String(formData.get("password")),
      });
      saveAuthSession(session, formData.get("remember") === "on");
      router.push("/dashboard");
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Something went wrong. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthPageFrame
      eyebrow="WELCOME BACK"
      title="Pick up where"
      highlight="you left off."
      description="Sign in with your email, roll number, or display name."
    >
      {passwordResetSuccess && (
        <AuthMessage message="Your password has been reset. Sign in with your new password." role="status" />
      )}
      <form className="auth-form" onSubmit={handleSubmit}>
        <AuthTextField
          id="identifier"
          label="Email, roll number, or name"
          placeholder="you@example.com"
          autoComplete="username"
        />
        <AuthPasswordField
          id="password"
          label="Password"
          placeholder="Your password"
          autoComplete="current-password"
        />
        <div className="form-utility">
          <label className="remember-me">
            <input type="checkbox" name="remember" />
            <span>Keep me signed in</span>
          </label>
          <Link href="/forgot-password">Forgot password?</Link>
        </div>
        <AuthSubmitButton label="Sign in" isSubmitting={isSubmitting} />
        <AuthMessage message={error} role="alert" />
      </form>
      <p className="auth-form-footer">
        New around here? <Link href="/register">Create an account <span aria-hidden="true">↗</span></Link>
      </p>
    </AuthPageFrame>
  );
}
