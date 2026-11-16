"use client";

import type { ChangeEvent, ReactNode } from "react";
import { useState } from "react";

export function AuthPageFrame({
  eyebrow,
  title,
  highlight,
  description,
  variant,
  children,
}: {
  eyebrow: string;
  title: string;
  highlight: string;
  description: string;
  variant?: "register";
  children: ReactNode;
}) {
  return (
    <div className={`auth-card ${variant === "register" ? "auth-card-register" : ""}`}>
      <div className="auth-kicker"><span aria-hidden="true">✳</span> {eyebrow}</div>
      <h2 className="auth-title">
        {title} <span>{highlight}</span>
      </h2>
      <p className="auth-description">{description}</p>
      {children}
      <div className="form-doodle" aria-hidden="true">made with a little ✳</div>
    </div>
  );
}

export function AuthTextField({
  id,
  label,
  placeholder,
  type = "text",
  autoComplete,
  hint,
  inputMode,
  min,
  max,
  maxLength,
  minLength,
  value,
  onChange,
  wide = false,
}: {
  id: string;
  label: string;
  placeholder: string;
  type?: "email" | "text" | "date" | "tel" | "number";
  autoComplete: string;
  hint?: string;
  inputMode?: "numeric" | "tel";
  min?: string;
  max?: string;
  maxLength?: number;
  minLength?: number;
  value?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  wide?: boolean;
}) {
  return (
    <div className={`auth-field ${wide ? "auth-field-wide" : ""}`}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        min={min}
        max={max}
        maxLength={maxLength}
        minLength={minLength}
        value={value}
        onChange={onChange}
        data-hover-tilt="2.5"
        data-hover-depth="6"
        required
      />
      {hint && <small>{hint}</small>}
    </div>
  );
}

export function AuthPasswordField({
  id,
  label,
  placeholder,
  autoComplete,
  minLength,
  maxLength = 128,
}: {
  id: string;
  label: string;
  placeholder: string;
  autoComplete: string;
  minLength?: number;
  maxLength?: number;
}) {
  return (
    <PasswordField
      id={id}
      label={label}
      placeholder={placeholder}
      autoComplete={autoComplete}
      minLength={minLength}
      maxLength={maxLength}
    />
  );
}

function PasswordField({
  id,
  label,
  placeholder,
  autoComplete,
  minLength,
  maxLength,
}: {
  id: string;
  label: string;
  placeholder: string;
  autoComplete: string;
  minLength?: number;
  maxLength: number;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <div className="auth-password-input">
        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          autoComplete={autoComplete}
          minLength={minLength}
          maxLength={maxLength}
          data-hover-tilt="2.5"
          data-hover-depth="6"
          required
        />
        <button
          className="password-visibility-toggle"
          type="button"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? (
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
    </div>
  );
}

export function AuthSubmitButton({
  label,
  isSubmitting,
}: {
  label: string;
  isSubmitting: boolean;
}) {
  return (
    <button
      className="auth-submit"
      type="submit"
      disabled={isSubmitting}
      data-hover-tilt="4"
      data-hover-depth="12"
    >
      <span>{isSubmitting ? "Please wait..." : label}</span>
      <span className="button-arrow" aria-hidden="true">↗</span>
    </button>
  );
}

export function AuthMessage({
  message,
  role,
}: {
  message: string;
  role: "alert" | "status";
}) {
  if (!message) return null;
  return <p className="form-notice" role={role}>{message}</p>;
}
