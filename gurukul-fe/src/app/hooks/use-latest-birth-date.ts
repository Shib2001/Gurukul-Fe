"use client";

import { useSyncExternalStore } from "react";

function subscribeToDateChanges() {
  return () => {};
}

function getLatestBirthDate() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
}

export function useLatestBirthDate() {
  return useSyncExternalStore(subscribeToDateChanges, getLatestBirthDate, () => "");
}
