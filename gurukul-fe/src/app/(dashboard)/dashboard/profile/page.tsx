"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { DashboardFooter } from "@/app/components/dashboard/dashboard-footer";
import { DashboardHeader } from "@/app/components/dashboard/dashboard-header";
import { useHomeDashboard } from "@/app/hooks/use-home-dashboard";
import { useLatestBirthDate } from "@/app/hooks/use-latest-birth-date";
import { AuthApiError, updateCurrentStudent } from "@/services/auth-service";
import type { Student } from "@/services/auth-service";
import { getErrorMessage } from "@/utils/get-error-message";

type ProfileValues = {
  display_name: string;
  date_of_birth: string;
  grade_level: string;
  phone_number: string;
  liked_subjects: string;
};

function getProfileValues(student: Student): ProfileValues {
  return {
    display_name: student.display_name,
    date_of_birth: student.date_of_birth?.slice(0, 10) ?? "",
    grade_level: student.grade_level ?? "",
    phone_number: student.phone_number ?? "",
    liked_subjects: student.liked_subjects.join(", "),
  };
}

function ProfileField({
  id,
  label,
  value,
  type = "text",
  readOnly = false,
  required = false,
  maxLength,
  min,
  max,
  autoComplete,
  hint,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  type?: "text" | "email" | "date" | "tel" | "number";
  readOnly?: boolean;
  required?: boolean;
  maxLength?: number;
  min?: string;
  max?: string;
  autoComplete?: string;
  hint?: string;
  onChange?: (value: string) => void;
}) {
  const hintId = `${id}-hint`;

  return (
    <div className="grid gap-1.5">
      <label className="text-[11px] font-bold text-[#4c4942]" htmlFor={id}>{label}</label>
      <input
        className={`min-h-11 w-full border-[1.5px] px-3 text-sm text-[#292722] outline-none transition-colors focus:border-[#ee5d58] focus-visible:ring-2 focus-visible:ring-[#ee5d58]/30 ${
          readOnly ? "border-[#d5d0c5] bg-[#f3f0e7]" : "border-[#aaa397] bg-[#fffefa]"
        }`}
        id={id}
        name={id}
        type={type}
        value={value}
        readOnly={readOnly}
        required={required}
        maxLength={maxLength}
        min={min}
        max={max}
        autoComplete={autoComplete}
        aria-describedby={hint ? hintId : undefined}
        onChange={onChange ? (event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value) : undefined}
      />
      {hint && <small className="text-[11px] leading-relaxed text-[#777267]" id={hintId}>{hint}</small>}
    </div>
  );
}

function ProfileEditor({
  student: initialStudent,
  isSigningOut,
  logoutError,
  onSignOut,
}: {
  student: Student;
  isSigningOut: boolean;
  logoutError: string;
  onSignOut: () => void;
}) {
  const router = useRouter();
  const maxBirthDate = useLatestBirthDate();
  const [student, setStudent] = useState(initialStudent);
  const [values, setValues] = useState(() => getProfileValues(initialStudent));
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function updateField(field: keyof ProfileValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    const displayName = values.display_name.trim();
    const dateOfBirth = values.date_of_birth.trim();
    const gradeLevel = values.grade_level.trim();
    const phoneNumber = values.phone_number.trim();
    const currentSubjects = student.liked_subjects ?? [];
    const subjects = values.liked_subjects
      .split(/[,\n]/)
      .map((subject) => subject.trim())
      .filter(Boolean);

    if (!displayName || displayName.length > 120) {
      setError("Enter a name between 1 and 120 characters.");
      return;
    }
    if (student.date_of_birth && !dateOfBirth) {
      setError("The API does not support clearing a date of birth. Enter a date or restore the current value.");
      return;
    }
    if (dateOfBirth && maxBirthDate && dateOfBirth > maxBirthDate) {
      setError("Date of birth must be in the past.");
      return;
    }
    if (student.grade_level && !gradeLevel) {
      setError("The API does not support clearing a grade. Enter a grade from 1 to 10.");
      return;
    }
    if (gradeLevel && (!/^\d+$/.test(gradeLevel) || Number(gradeLevel) < 1 || Number(gradeLevel) > 10)) {
      setError("Grade level must be a whole number from 1 to 10.");
      return;
    }
    if (student.phone_number && !phoneNumber) {
      setError("The API does not support clearing a phone number. Enter a number or restore the current value.");
      return;
    }
    const phoneDigits = phoneNumber.replace(/\D/g, "");
    if (phoneNumber && (!/^\+?[\d\s().-]+$/.test(phoneNumber) || phoneDigits.length < 7 || phoneDigits.length > 15)) {
      setError("Enter a phone number with 7 to 15 digits.");
      return;
    }
    if (currentSubjects.length > 0 && subjects.length === 0) {
      setError("Keep at least one favorite subject in your profile.");
      return;
    }
    if (subjects.length > 20 || subjects.some((subject) => subject.length > 50)) {
      setError("Add no more than 20 subjects, with each name 50 characters or fewer.");
      return;
    }
    if (new Set(subjects.map((subject) => subject.toLowerCase())).size !== subjects.length) {
      setError("Remove duplicate subjects before saving.");
      return;
    }

    const changes: Parameters<typeof updateCurrentStudent>[0] = {};
    if (displayName !== student.display_name) changes.display_name = displayName;
    if (dateOfBirth && dateOfBirth !== (student.date_of_birth?.slice(0, 10) ?? "")) {
      changes.date_of_birth = dateOfBirth;
    }
    if (gradeLevel && gradeLevel !== (student.grade_level ?? "")) {
      changes.grade_level = Number(gradeLevel);
    }
    if (phoneNumber && phoneNumber !== (student.phone_number ?? "")) {
      changes.phone_number = phoneNumber;
    }
    if (JSON.stringify(subjects) !== JSON.stringify(currentSubjects)) {
      changes.liked_subjects = subjects;
    }

    if (Object.keys(changes).length === 0) {
      setNotice("Your profile is already up to date.");
      return;
    }

    setIsSaving(true);
    try {
      const updatedStudent = await updateCurrentStudent(changes);
      setStudent(updatedStudent);
      setValues(getProfileValues(updatedStudent));
      setNotice("Your profile has been updated.");
    } catch (submitError) {
      if (submitError instanceof AuthApiError && submitError.status === 401) {
        router.replace("/login?session=expired");
        return;
      }
      setError(getErrorMessage(submitError, "We couldn’t save your profile. Please try again."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="min-h-svh overflow-hidden bg-[#fbfaf6] [background-image:radial-gradient(#26231d_0.45px,transparent_0.45px)] [background-size:19px_19px] text-[#292722]">
      <a className="fixed left-3 top-3 z-50 -translate-y-[160%] bg-[#292722] px-4 py-2.5 text-[#fffefa] focus:translate-y-0" href="#main-content">
        Skip to content
      </a>
      <DashboardHeader
        activePage="profile"
        student={student}
        isSigningOut={isSigningOut}
        onSignOut={onSignOut}
      />

      <main className="mx-auto w-full max-w-[1244px] px-4 pb-8 pt-7 sm:px-8 sm:pt-10" id="main-content">
        {logoutError && (
          <p className="mb-5 border-l-[3px] border-[#ee5d58] bg-[#fff3ef] px-4 py-3 text-[13px] text-[#5b332f]" role="alert">
            {logoutError} <Link className="ml-2 font-bold text-[#292722] underline" href="/login">Continue</Link>
          </p>
        )}

        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="m-0 text-[10px] font-extrabold tracking-[0.18em] text-[#625e54]">YOUR STUDENT ACCOUNT</p>
            <h1 className="mb-0 mt-2 font-serif text-[clamp(34px,5vw,48px)] font-bold leading-tight tracking-[-0.06em]">
              My profile
            </h1>
            <p className="mb-0 mt-2 max-w-[560px] text-sm leading-relaxed text-[#625e54]">
              Keep your student details and favorite subjects up to date.
            </p>
          </div>
          <span className="border border-[#302d29] bg-[#fff0b8] px-3 py-2 text-[10px] font-extrabold tracking-[0.12em] shadow-[2px_3px_0_#292722]">
            {student.grade_level ? `GRADE ${student.grade_level}` : "STUDENT"}
          </span>
        </div>

        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-6">
          <section className="border-[1.5px] border-[#302d29] bg-[#f3f0e7] p-5 shadow-[4px_5px_0_#292722] sm:p-7" aria-labelledby="account-details-title">
            <p className="m-0 text-[10px] font-extrabold tracking-[0.16em] text-[#625e54]">ACCOUNT DETAILS</p>
            <h2 className="mb-5 mt-2 font-serif text-2xl font-bold" id="account-details-title">Your school identity</h2>
            <div className="grid gap-4">
              <ProfileField id="profile-email" label="Email address" value={student.email} readOnly />
              <ProfileField id="profile-roll-number" label="Roll number" value={student.roll_number} readOnly />
              <p className="m-0 text-[11px] leading-relaxed text-[#777267]">
                Email and roll number are managed by your school and can’t be changed here.
              </p>
            </div>
          </section>

          <section className="border-[1.5px] border-[#302d29] bg-[#fffefa] p-5 shadow-[4px_5px_0_#e7e2d7] sm:p-7" aria-labelledby="edit-profile-title">
            <p className="m-0 text-[10px] font-extrabold tracking-[0.16em] text-[#625e54]">PERSONAL INFORMATION</p>
            <h2 className="mb-5 mt-2 font-serif text-2xl font-bold" id="edit-profile-title">Edit your details</h2>

            <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
              <ProfileField
                id="display_name"
                label="Display name"
                value={values.display_name}
                maxLength={120}
                autoComplete="name"
                required
                onChange={(value) => updateField("display_name", value)}
              />
              <ProfileField
                id="date_of_birth"
                label="Date of birth"
                type="date"
                value={values.date_of_birth}
                max={maxBirthDate}
                required={Boolean(student.date_of_birth)}
                hint="Leave blank only if no date is currently saved."
                onChange={(value) => updateField("date_of_birth", value)}
              />
              <ProfileField
                id="grade_level"
                label="Grade level"
                type="number"
                value={values.grade_level}
                min="1"
                max="10"
                required={Boolean(student.grade_level)}
                onChange={(value) => updateField("grade_level", value)}
              />
              <ProfileField
                id="phone_number"
                label="Phone number"
                type="tel"
                value={values.phone_number}
                autoComplete="tel"
                required={Boolean(student.phone_number)}
                hint="Use 7 to 15 digits. Formatting such as spaces and + is okay."
                onChange={(value) => updateField("phone_number", value)}
              />
              <div className="sm:col-span-2">
                <ProfileField
                  id="liked_subjects"
                  label="Favorite subjects"
                  value={values.liked_subjects}
                  hint="Separate subjects with commas. Add at least one to update this list."
                  onChange={(value) => updateField("liked_subjects", value)}
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1 sm:col-span-2">
                <button
                  className="inline-flex min-h-11 items-center gap-4 border-[1.5px] border-[#292722] bg-[#292722] px-4 text-sm font-bold text-[#fffefa] shadow-[3px_4px_0_#ee5d58] transition hover:-translate-y-px hover:bg-[#ee5d58] hover:shadow-[4px_5px_0_#292722] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ee5d58] disabled:cursor-wait disabled:opacity-65"
                  type="submit"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save changes"} <span aria-hidden="true">↗</span>
                </button>
                <button
                  className="min-h-11 border border-[#d5d0c5] bg-[#fbfaf6] px-4 text-sm font-semibold text-[#625e54] transition-colors hover:border-[#302d29] hover:text-[#292722] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ee5d58] disabled:opacity-60"
                  type="button"
                  onClick={() => {
                    setValues(getProfileValues(student));
                    setError("");
                    setNotice("");
                  }}
                  disabled={isSaving}
                >
                  Reset changes
                </button>
              </div>
              {error && <p className="m-0 text-sm text-[#9b3b34]" role="alert">{error}</p>}
              {notice && <p className="m-0 text-sm text-[#38634a]" role="status">{notice}</p>}
            </form>
          </section>
        </div>
      </main>
      <DashboardFooter />
    </div>
  );
}

export default function ProfilePage() {
  const {
    student,
    isLoading,
    loadError,
    logoutError,
    isSigningOut,
    retry,
    signOut,
  } = useHomeDashboard();

  if (isLoading) {
    return (
      <main className="grid min-h-svh place-content-center justify-items-center bg-[#fbfaf6] text-[#292722]" aria-live="polite">
        <span className="animate-bounce font-serif text-[45px] text-[#ee5d58] motion-reduce:animate-none" aria-hidden="true">✎</span>
        <p className="mt-2 font-serif text-lg italic text-[#625e54]">Opening your profile...</p>
      </main>
    );
  }

  if (loadError || !student) {
    return (
      <main className="grid min-h-svh place-content-center justify-items-center bg-[#fbfaf6] p-6 text-[#292722]">
        <section className="w-full max-w-[430px] border-[1.5px] border-[#302d29] bg-[#fffefa] p-8 text-center shadow-[5px_6px_0_#292722]" role="alert">
          <p className="m-0 text-sm leading-relaxed text-[#625e54]">
            {loadError || "Your student profile could not be loaded."}
          </p>
          <button
            className="mt-5 min-h-11 border-[1.5px] border-[#292722] bg-[#292722] px-4 text-sm font-bold text-[#fffefa] shadow-[3px_4px_0_#ee5d58]"
            type="button"
            onClick={retry}
          >
            Try again
          </button>
        </section>
      </main>
    );
  }

  return (
    <ProfileEditor
      student={student}
      isSigningOut={isSigningOut}
      logoutError={logoutError}
      onSignOut={signOut}
    />
  );
}
