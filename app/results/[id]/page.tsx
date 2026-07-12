"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import ScoreCard from "@/components/ScoreCard";
import WordHighlightPlayer from "@/components/WordHighlightPlayer";
import { deleteResults, getResults } from "@/lib/api";
import type { ScoringResult, WordResult } from "@/types/scoring";

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [result, setResult] = useState<ScoringResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<WordResult | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getResults(sessionId)
      .then(setResult)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

    const stored = sessionStorage.getItem(`audio-${sessionId}`);
    if (stored) setAudioUrl(stored);
  }, [sessionId]);

  const handleWordClick = useCallback(
    (index: number) => {
      if (!result) return;
      const word = result.words[index];
      setSelectedWord(word);
      setActiveIndex(index);
    },
    [result]
  );

  const handleDelete = async () => {
    if (!confirm("Delete your results permanently? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await deleteResults(sessionId);
      sessionStorage.removeItem(`audio-${sessionId}`);
      router.push("/?deleted=1");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed.");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
        <p className="mt-4 text-gray-500">Loading results…</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-700">{error || "Results not found."}</p>
        <Link href="/" className="mt-4 inline-block text-brand-600 underline">
          ← Try again
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm text-brand-600 hover:underline">
        ← New recording
      </Link>

      <ScoreCard
        result={result}
        selectedWord={selectedWord}
        onDelete={handleDelete}
        deleting={deleting}
      />

      <WordHighlightPlayer
        words={result.words}
        audioUrl={audioUrl}
        activeIndex={activeIndex}
        onWordClick={handleWordClick}
      />
    </div>
  );
}
