"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AuthApiError, getCurrentStudent, logoutStudent, Student } from "@/lib/auth-api";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong while loading your study desk.";
}

export function useHomeDashboard() {
  const router = useRouter();
  const currentStudentRequest = useRef<Promise<Student> | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [logoutError, setLogoutError] = useState("");
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [retry, setRetry] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [showAllSubjects, setShowAllSubjects] = useState(false);
  useEffect(() => {
    let active = true;
    const request = currentStudentRequest.current ?? getCurrentStudent();
    currentStudentRequest.current = request;

    void request
      .then((currentStudent) => {
        if (active) {
          setStudent(currentStudent);
          setLoadError("");
        }
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (error instanceof AuthApiError && error.status === 401) {
          router.replace("/login?session=expired");
          return;
        }
        setLoadError(getErrorMessage(error));
      })
      .finally(() => {
        if (currentStudentRequest.current === request) {
          currentStudentRequest.current = null;
        }
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [retry, router]);

  async function signOut() {
    setLogoutError("");
    setIsSigningOut(true);
    try {
      await logoutStudent();
      router.replace("/login");
    } catch (error) {
      setLogoutError(
        `${getErrorMessage(error)} Your local session has been cleared. Continue to sign in.`,
      );
      setIsSigningOut(false);
    }
  }

  return {
    student,
    isLoading,
    loadError,
    logoutError,
    isSigningOut,
    selectedSubject,
    setSelectedSubject,
    showAllSubjects,
    setShowAllSubjects,
    retry: () => {
      setIsLoading(true);
      setRetry((value) => value + 1);
    },
    signOut,
  };
}
