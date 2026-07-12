"use client";

import clsx from "clsx";
import type { ScoringResult, WordResult } from "@/types/scoring";

interface ScoreCardProps {
  result: ScoringResult;
  selectedWord: WordResult | null;
  onDelete: () => void;
  deleting?: boolean;
}

function scoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-amber-600";
  return "text-red-600";
}

function ScoreRing({ score, label }: { score: number; label: string }) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="140" className="-rotate-90">
        <circle cx="70" cy="70" r="54" fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle
          cx="70"
          cy="70"
          r="54"
          fill="none"
          stroke={score >= 80 ? "#16a34a" : score >= 60 ? "#d97706" : "#dc2626"}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: 140, height: 140 }}>
        <span className={clsx("text-3xl font-bold", scoreColor(score))}>{score}</span>
        <span className="text-xs text-gray-500">{label}</span>
      </div>
    </div>
  );
}

export default function ScoreCard({ result, selectedWord, onDelete, deleting }: ScoreCardProps) {
  const errors = result.words.filter((w) => w.error_type !== "none");

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Your Score</h2>
            <p className="mt-1 text-sm text-gray-500">
              Session {result.session_id.slice(0, 8)}… · Expires{" "}
              {new Date(result.retention_expiry_at).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onDelete}
            disabled={deleting}
            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete my results"}
          </button>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-10">
          <div className="relative">
            <ScoreRing score={result.overall_score} label="Overall" />
          </div>
          <div className="space-y-3">
            <SubScore label="Accuracy" score={result.sub_scores.accuracy} />
            <SubScore label="Fluency" score={result.sub_scores.fluency} />
            <p className="text-sm text-gray-500">
              {errors.length} issue{errors.length !== 1 ? "s" : ""} found in{" "}
              {result.words.length} words
            </p>
          </div>
        </div>
      </div>

      {selectedWord && selectedWord.error_type !== "none" && (
        <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5">
          <h3 className="font-semibold text-brand-900">
            &ldquo;{selectedWord.word}&rdquo; — {selectedWord.error_type}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-brand-800">
            {selectedWord.feedback}
          </p>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-brand-700">
            <span>
              Expected: /{selectedWord.expected_phonemes.join("")}/
            </span>
            <span>
              Heard: /{selectedWord.actual_phonemes.join("") || "—"}/
            </span>
            <span>Score: {selectedWord.accuracy_score}/100</span>
          </div>
        </div>
      )}

      {errors.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">All Feedback</h3>
          <ul className="mt-3 space-y-3">
            {errors.map((w, i) => (
              <li key={i} className="rounded-lg bg-gray-50 p-3 text-sm">
                <span className="font-medium text-gray-900">&ldquo;{w.word}&rdquo;</span>
                <span className="ml-2 rounded bg-white px-2 py-0.5 text-xs capitalize text-gray-600">
                  {w.error_type}
                </span>
                <p className="mt-1 text-gray-700">{w.feedback}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function SubScore({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-sm text-gray-600">{label}</span>
      <div className="h-2 w-40 overflow-hidden rounded-full bg-gray-100">
        <div
          className={clsx(
            "h-full rounded-full transition-all",
            score >= 80 ? "bg-green-500" : score >= 60 ? "bg-amber-500" : "bg-red-500"
          )}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={clsx("text-sm font-semibold", scoreColor(score))}>{score}</span>
    </div>
  );
}
