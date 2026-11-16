"use client";

import { useRef } from "react";

export function OtpCodeInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  function focusDigit(index: number) {
    inputs.current[Math.max(0, Math.min(index, 5))]?.focus();
  }

  function updateDigit(index: number, input: string) {
    const digits = input.replace(/\D/g, "");
    if (digits.length > 1) {
      const pastedDigits = digits.slice(0, 6).split("");
      onChange([...pastedDigits, ...Array(6 - pastedDigits.length).fill("")]);
      focusDigit(pastedDigits.length - 1);
      return;
    }

    const next = [...value];
    next[index] = digits.slice(-1);
    onChange(next);
    if (digits && index < 5) focusDigit(index + 1);
  }

  function pasteCode(event: React.ClipboardEvent<HTMLInputElement>) {
    const digits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!digits) return;
    event.preventDefault();
    const pastedDigits = digits.split("");
    onChange([...pastedDigits, ...Array(6 - pastedDigits.length).fill("")]);
    focusDigit(digits.length - 1);
  }

  return (
    <div className="auth-otp-inputs" role="group" aria-label="6-digit verification code">
      {Array.from({ length: 6 }, (_, index) => (
        <input
          key={index}
          ref={(input) => {
            inputs.current[index] = input;
          }}
          id={`otp-digit-${index}`}
          className={`auth-otp-digit ${value[index] ? "has-value" : ""}`}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${index + 1} of 6`}
          value={value[index] ?? ""}
          maxLength={1}
          pattern="[0-9]"
          data-hover-tilt="2.5"
          data-hover-depth="6"
          onChange={(event) => updateDigit(index, event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Backspace" && !value[index] && index > 0) {
              focusDigit(index - 1);
            } else if (event.key === "ArrowLeft") {
              focusDigit(index - 1);
            } else if (event.key === "ArrowRight") {
              focusDigit(index + 1);
            }
          }}
          onPaste={pasteCode}
        />
      ))}
    </div>
  );
}
