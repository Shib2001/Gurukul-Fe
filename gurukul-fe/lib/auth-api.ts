const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is required.");
}
const AUTH_PATH = `${API_BASE_URL.replace(/\/$/, "")}/api/v1/auth`;
const SESSION_KEY = "gurukul.auth.session";
const RESET_TOKEN_KEY = "gurukul.auth.reset-token";
const DEVELOPMENT_CODE_KEY = "gurukul.auth.development-code";

export type Student = {
  id: string;
  roll_number: string;
  display_name: string;
  email: string;
  date_of_birth: string | null;
  grade_level: string | null;
  phone_number: string | null;
  liked_subjects: string[];
};

export type AuthSession = {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  student: Student;
};

type ApiEnvelope<T> = {
  status_code: number;
  message: string;
  data: T;
};

type ApiErrorEnvelope = {
  message?: string;
  detail?: string;
  errors?: Array<{ field?: string; message: string }>;
};

export class AuthApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "AuthApiError";
  }
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; accessToken?: string } = {},
): Promise<T> {
  const response = await fetch(`${AUTH_PATH}${path}`, {
    method: options.method ?? "POST",
    headers: {
      "Content-Type": "application/json",
      ...(options.accessToken
        ? { Authorization: `Bearer ${options.accessToken}` }
        : {}),
    },
    ...(options.body === undefined
      ? {}
      : { body: JSON.stringify(options.body) }),
  });

  let payload: ApiEnvelope<T> | T | ApiErrorEnvelope;
  try {
    payload = await response.json();
  } catch {
    throw new AuthApiError(
      `The authentication service returned an unreadable response (${response.status}).`,
      response.status,
    );
  }

  if (!response.ok) {
    const error = payload as ApiErrorEnvelope;
    const validationMessages = error.errors
      ?.map(({ field, message }) => `${field ? `${field}: ` : ""}${message}`)
      .join(" ");
    throw new AuthApiError(
      validationMessages || error.detail || error.message || "Authentication request failed.",
      response.status,
    );
  }

  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiEnvelope<T>).data;
  }
  return payload as T;
}

export function registerStudent(input: {
  display_name: string;
  date_of_birth: string;
  grade_level: number;
  liked_subjects: string[];
  phone_number: string;
  email: string;
  password: string;
}) {
  return request<{ message: string; email: string; roll_number: string; verification_code?: string }>(
    "/register",
    { body: input },
  );
}

export function verifyEmail(input: { identifier: string; code: string }) {
  return request<AuthSession>("/verify-email", { body: input });
}

export function resendVerificationCode(input: { identifier: string }) {
  return request<{ message: string; verification_code?: string }>(
    "/verify-email/resend",
    { body: input },
  );
}

export function loginStudent(input: { identifier: string; password: string }) {
  return request<AuthSession>("/login", { body: input });
}

export function requestPasswordReset(input: { identifier: string }) {
  return request<{ message: string; otp_code?: string }>(
    "/password-reset/request",
    { body: input },
  );
}

export function verifyPasswordReset(input: { identifier: string; code: string }) {
  return request<{ reset_token: string; expires_in_seconds: number }>(
    "/password-reset/verify",
    { body: input },
  );
}

export function confirmPasswordReset(input: {
  reset_token: string;
  new_password: string;
}) {
  return request<{ message: string }>("/password-reset/confirm", { body: input });
}

function getStoredSession(): { session: AuthSession; persistent: boolean } | null {
  if (typeof window === "undefined") return null;
  const stored =
    window.localStorage.getItem(SESSION_KEY) ??
    window.sessionStorage.getItem(SESSION_KEY);
  if (!stored) return null;

  try {
    return {
      session: JSON.parse(stored) as AuthSession,
      persistent: window.localStorage.getItem(SESSION_KEY) !== null,
    };
  } catch {
    clearAuthSession();
    throw new AuthApiError("Your saved sign-in session is invalid. Please sign in again.", 401);
  }
}

export function saveAuthSession(session: AuthSession, persistent = false) {
  if (typeof window === "undefined") return;
  clearAuthSession();
  const storage = persistent ? window.localStorage : window.sessionStorage;
  storage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
  window.sessionStorage.removeItem(SESSION_KEY);
}

export async function refreshAuthSession() {
  const stored = getStoredSession();
  if (!stored) throw new AuthApiError("Please sign in again.", 401);

  try {
    const refreshed = await request<AuthSession>("/refresh", {
      body: { refresh_token: stored.session.refresh_token },
    });
    saveAuthSession(refreshed, stored.persistent);
    return refreshed;
  } catch (error) {
    if (error instanceof AuthApiError && error.status === 401) clearAuthSession();
    throw error;
  }
}

async function authenticatedRequest<T>(path: string, options: {
  method?: string;
  body?: unknown;
} = {}): Promise<T> {
  const stored = getStoredSession();
  if (!stored) throw new AuthApiError("Please sign in again.", 401);

  try {
    return await request<T>(path, { ...options, accessToken: stored.session.access_token });
  } catch (error) {
    if (!(error instanceof AuthApiError) || error.status !== 401) throw error;
    const refreshed = await refreshAuthSession();
    return request<T>(path, { ...options, accessToken: refreshed.access_token });
  }
}

export function getCurrentStudent() {
  return authenticatedRequest<Student>("/me", { method: "GET" });
}

export function updateCurrentStudent(input: {
  display_name?: string;
  date_of_birth?: string;
  grade_level?: number;
  liked_subjects?: string[];
  phone_number?: string;
}) {
  return authenticatedRequest<Student>("/me", { method: "PATCH", body: input });
}

export async function logoutStudent() {
  const stored = getStoredSession();
  if (!stored) return;
  try {
    await request<{ message: string }>("/logout", {
      body: { refresh_token: stored.session.refresh_token },
    });
  } finally {
    clearAuthSession();
  }
}

export function savePasswordResetToken(token: string) {
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(RESET_TOKEN_KEY, token);
  }
}

export function getPasswordResetToken() {
  return typeof window === "undefined"
    ? null
    : window.sessionStorage.getItem(RESET_TOKEN_KEY);
}

export function clearPasswordResetToken() {
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(RESET_TOKEN_KEY);
  }
}

export function saveDevelopmentCode(code: string | undefined) {
  if (typeof window === "undefined") return;
  if (code) window.sessionStorage.setItem(DEVELOPMENT_CODE_KEY, code);
  else window.sessionStorage.removeItem(DEVELOPMENT_CODE_KEY);
  window.dispatchEvent(new Event("auth-development-code"));
}

export function getDevelopmentCode() {
  return typeof window === "undefined"
    ? ""
    : window.sessionStorage.getItem(DEVELOPMENT_CODE_KEY) ?? "";
}

export function clearDevelopmentCode() {
  saveDevelopmentCode(undefined);
}
