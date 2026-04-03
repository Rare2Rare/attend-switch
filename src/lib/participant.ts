"use client";

const TOKEN_KEY = "attend-switch-participant-token";
const NAME_KEY = "attend-switch-display-name";

export function getParticipantToken(): string {
  let token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(TOKEN_KEY, token);
  }
  return token;
}

export function getSavedDisplayName(): string {
  return localStorage.getItem(NAME_KEY) ?? "";
}

export function saveDisplayName(name: string): void {
  localStorage.setItem(NAME_KEY, name);
}

export function setParticipantToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}
