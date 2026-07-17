// Client-only "shareable link" mechanic. No backend: a challenge's state is
// carried entirely in the URL hash as base64url-encoded JSON, plus a copy in
// localStorage for the creating browser so it can show a waiting state.
//
// Two kinds of payloads travel this way:
//   duel   - created by Player A: { challengeId, seasonId, rosterA, labelA }
//   result - created by Player B after simulating: the full sim result, so
//            Player A can open the same link and see the identical reveal.

function toBase64Url(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(b64) {
  const padded = b64.replace(/-/g, "+").replace(/_/g, "/").padEnd(
    b64.length + ((4 - (b64.length % 4)) % 4),
    "="
  );
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function encodePayload(kind, data) {
  const json = JSON.stringify({ kind, data });
  return toBase64Url(json);
}

export function decodePayload(encoded) {
  try {
    const json = fromBase64Url(encoded);
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

export function buildShareUrl(kind, data) {
  const url = new URL(window.location.href);
  url.hash = "";
  const param = kind === "result" ? "result" : "duel";
  return `${url.origin}${url.pathname}#${param}=${encodePayload(kind, data)}`;
}

export function readUrlPayload() {
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) return null;
  const [key, ...rest] = hash.split("=");
  const value = rest.join("=");
  if (!value) return null;
  if (key !== "duel" && key !== "result") return null;
  const payload = decodePayload(value);
  if (!payload) return null;
  return payload;
}

export function makeChallengeId() {
  return Math.random().toString(36).slice(2, 10);
}

const STORAGE_PREFIX = "draftduel:challenge:";

export function saveLocalChallenge(challengeId, data) {
  localStorage.setItem(STORAGE_PREFIX + challengeId, JSON.stringify(data));
}

export function loadLocalChallenge(challengeId) {
  const raw = localStorage.getItem(STORAGE_PREFIX + challengeId);
  return raw ? JSON.parse(raw) : null;
}
