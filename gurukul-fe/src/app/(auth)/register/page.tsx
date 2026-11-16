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
import { useLatestBirthDate } from "@/app/hooks/use-latest-birth-date";
import { registerStudent, saveDevelopmentCode } from "@/services/auth-service";
import { getErrorMessage } from "@/utils/get-error-message";

export default function RegisterPage() {
  const router = useRouter();
  const latestBirthDate = useLatestBirthDate();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email")).trim();
    const subjects = String(formData.get("liked_subjects"))
      .split(/[,\n]/)
      .map((subject) => subject.trim())
      .filter(Boolean);

    try {
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
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Something went wrong. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthPageFrame
      eyebrow="LET'S GET STARTED"
      title="A fresh page,"
      highlight="just for you."
      description="Create your student account and make learning your own."
      variant="register"
    >
      <form className="auth-form auth-form-register" onSubmit={handleSubmit}>
        <AuthTextField
          id="display_name"
          label="Your name"
          placeholder="How should we call you?"
          autoComplete="name"
          maxLength={120}
        />
        <AuthTextField
          id="email"
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
        />
        <AuthTextField
          id="date_of_birth"
          label="Date of birth"
          type="date"
          placeholder=""
          autoComplete="bday"
          max={latestBirthDate}
        />
        <AuthTextField
          id="grade_level"
          label="Grade level (1–10)"
          type="number"
          placeholder="e.g. 8"
          autoComplete="off"
          min="1"
          max="10"
        />
        <AuthTextField
          id="phone_number"
          label="Phone number"
          type="tel"
          placeholder="+91 9876543210"
          autoComplete="tel"
          inputMode="tel"
        />
        <AuthPasswordField
          id="password"
          label="Create a password"
          placeholder="8 to 128 characters"
          autoComplete="new-password"
          minLength={8}
        />
        <AuthTextField
          id="liked_subjects"
          label="Subjects you like"
          placeholder="Mathematics, Science"
          autoComplete="off"
          hint="Separate subjects with commas."
          wide
        />
        <label className="terms-check">
          <input type="checkbox" name="terms" required />
          <span>I agree to the Gurukul.ai Terms and Privacy Policy.</span>
        </label>
        <AuthSubmitButton label="Create account" isSubmitting={isSubmitting} />
        <AuthMessage message={error} role="alert" />
      </form>
      <p className="auth-form-footer">
        Already have an account? <Link href="/login">Sign in</Link>
        <span className="auth-secondary-link">Have a verification code? <Link href="/verify-otp">Enter it here</Link></span>
      </p>
    </AuthPageFrame>
  );
}
