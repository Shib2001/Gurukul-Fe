"use client";

import { useSyncExternalStore } from "react";
import { getDevelopmentCode } from "@/services/auth-service";

function subscribeToLocation(callback: () => void) {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
}

function getLocationSearch() {
  return window.location.search;
}

function subscribeToDevelopmentCode(callback: () => void) {
  window.addEventListener("auth-development-code", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("auth-development-code", callback);
    window.removeEventListener("storage", callback);
  };
}

export function useAuthSearch() {
  return useSyncExternalStore(subscribeToLocation, getLocationSearch, () => "");
}

export function useDevelopmentCode() {
  return useSyncExternalStore(subscribeToDevelopmentCode, getDevelopmentCode, () => "");
}
