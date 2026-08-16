"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import ConsentModal from "@/components/ConsentModal";
import Recorder from "@/components/Recorder";
import { analyzeAudio, checkHealth, recordConsent } from "@/lib/api";

export default function HomePage() {
  const router = useRouter();
  const [consentOpen, setConsentOpen] = useState(true);
  const [consented, setConsented] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<"checking" | "ok" | "down">("checking");

  useEffect(() => {
    checkHealth()
      .then((h) => setApiStatus(h.models_loaded ? "ok" : "ok"))
      .catch(() => setApiStatus("down"));
  }, []);

  const handleAcceptConsent = useCallback(async () => {
    try {
      const res = await recordConsent();
      setSessionId(res.session_id);
      setConsented(true);
      setConsentOpen(false);
    } catch {
      setError("Could not record consent. Is the backend running?");
    }
  }, []);

  const handleAnalyze = async () => {
    if (!sessionId || !audioFile) return;
    setLoading(true);
    setError(null);
    try {
      let activeSession = sessionId;
      try {
        const result = await analyzeAudio(activeSession, audioFile);
        sessionStorage.setItem(`audio-${result.session_id}`, URL.createObjectURL(audioFile));
        router.push(`/results/${result.session_id}`);
        return;
      } catch (first) {
        const msg = first instanceof Error ? first.message : "";
        // Backend SQLite wiped on Render restart — refresh consent and retry once.
        if (!/consent|403|Forbidden/i.test(msg)) throw first;
        const res = await recordConsent();
        activeSession = res.session_id;
        setSessionId(activeSession);
        const result = await analyzeAudio(activeSession, audioFile);
        sessionStorage.setItem(`audio-${result.session_id}`, URL.createObjectURL(audioFile));
        router.push(`/results/${result.session_id}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ConsentModal
        open={consentOpen && !consented}
        onAccept={handleAcceptConsent}
        onDecline={() => setConsentOpen(false)}
      />

      <div className="space-y-8">
        <section className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Improve Your English Pronunciation
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-gray-600">
            Record or upload up to 3 minutes of English speech and get an overall score plus
            clear, word-by-word feedback you can practice with.
          </p>
          {apiStatus === "down" && (
            <p className="mt-3 text-sm text-red-600">
              We&apos;re waking up the scoring service — wait a moment and refresh.
            </p>
          )}
        </section>

        <Recorder
          disabled={!consented || loading}
          onRecordingReady={(file) => {
            setAudioFile(file);
            setError(null);
          }}
          onError={setError}
        />

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {audioFile && consented && (
          <div className="flex justify-center">
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="rounded-xl bg-brand-600 px-8 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-brand-700 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Spinner /> Analyzing… (may take 1–2 min)
                </span>
              ) : (
                "Analyze Pronunciation"
              )}
            </button>
          </div>
        )}

        {!consented && !consentOpen && (
          <p className="text-center text-sm text-gray-500">
            Consent is required to use this service.{" "}
            <button
              onClick={() => setConsentOpen(true)}
              className="text-brand-600 underline"
            >
              Review consent
            </button>
          </p>
        )}

        <section className="grid gap-4 sm:grid-cols-3">
          <Feature icon="🔒" title="Private" desc="Your audio is scored and then discarded — nothing personal is kept." />
          <Feature icon="✨" title="Clear feedback" desc="See which words need work and how to improve them." />
          <Feature icon="📊" title="Word by word" desc="Follow along with highlights as you review your recording." />
        </section>
      </div>
    </>
  );
}

function Feature({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
      <div className="text-2xl">{icon}</div>
      <h3 className="mt-2 font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{desc}</p>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}
