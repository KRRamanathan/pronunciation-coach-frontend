import type { ConsentResponse, ScoringResult } from "@/types/scoring";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7860";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (typeof body.detail === "string") detail = body.detail;
      else if (Array.isArray(body.detail)) detail = body.detail.map((d: { msg?: string }) => d.msg).join(", ");
    } catch {
      /* non-JSON error body */
    }
    throw new Error(detail);
  }
  return res.json();
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Retry on network failures — Render free cold starts often drop the first request. */
async function apiFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const attempts = 4;
  let lastError: unknown;

  for (let i = 0; i < attempts; i++) {
    try {
      return await fetch(input, init);
    } catch (err) {
      lastError = err;
      if (i < attempts - 1) {
        await sleep(2000 * (i + 1)); // 2s, 4s, 6s
      }
    }
  }

  throw new Error(
    "Cannot reach the backend API at " +
      API_BASE +
      ". The free Render service may be waking up — wait about a minute and try again. " +
      "Use https://pronunciation-coach-frontend.vercel.app"
  );
}

export async function recordConsent(): Promise<ConsentResponse> {
  const res = await apiFetch(`${API_BASE}/api/consent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accepted: true }),
  });
  return handleResponse<ConsentResponse>(res);
}

export async function analyzeAudio(
  sessionId: string,
  audioFile: File
): Promise<ScoringResult> {
  const form = new FormData();
  form.append("audio", audioFile);
  form.append("session_id", sessionId);

  const res = await apiFetch(`${API_BASE}/api/analyze`, {
    method: "POST",
    body: form,
  });
  return handleResponse<ScoringResult>(res);
}

export async function getResults(sessionId: string): Promise<ScoringResult> {
  const res = await apiFetch(`${API_BASE}/api/results/${sessionId}`);
  return handleResponse<ScoringResult>(res);
}

export async function deleteResults(sessionId: string): Promise<void> {
  const res = await apiFetch(`${API_BASE}/api/results/${sessionId}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 204) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Delete failed (${res.status})`);
  }
}

export async function checkHealth(): Promise<{ status: string; models_loaded: boolean }> {
  const res = await apiFetch(`${API_BASE}/api/health`);
  return handleResponse(res);
}

export { API_BASE };
