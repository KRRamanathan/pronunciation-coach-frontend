"use client";

import clsx from "clsx";
import type { WordResult } from "@/types/scoring";

interface WordHighlightPlayerProps {
  words: WordResult[];
  audioUrl?: string | null;
  activeIndex: number | null;
  onWordClick: (index: number) => void;
}

const ERROR_COLORS: Record<string, string> = {
  none: "bg-green-100 text-green-900 border-green-300",
  mispronunciation: "bg-amber-100 text-amber-900 border-amber-400",
  omission: "bg-red-100 text-red-900 border-red-400",
  insertion: "bg-purple-100 text-purple-900 border-purple-400",
  unclear: "bg-gray-200 text-gray-700 border-gray-400",
};

export default function WordHighlightPlayer({
  words,
  audioUrl,
  activeIndex,
  onWordClick,
}: WordHighlightPlayerProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">Transcript</h3>

      {audioUrl && (
        <audio controls src={audioUrl} className="mt-3 w-full" preload="metadata" />
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {words.map((w, i) => (
          <button
            key={`${w.word}-${w.start_ms}-${i}`}
            onClick={() => onWordClick(i)}
            title={
              w.error_type !== "none"
                ? `${w.error_type}: ${w.feedback || ""}`
                : `Score: ${w.accuracy_score}`
            }
            className={clsx(
              "rounded-lg border px-2.5 py-1 text-sm font-medium transition hover:scale-105",
              ERROR_COLORS[w.error_type] || ERROR_COLORS.none,
              activeIndex === i && "ring-2 ring-brand-500 ring-offset-1"
            )}
          >
            {w.word}
            {w.error_type !== "none" && (
              <span className="ml-1 text-xs opacity-70">({w.accuracy_score})</span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-600">
        <Legend color="bg-green-100 border-green-300" label="Correct" />
        <Legend color="bg-amber-100 border-amber-400" label="Mispronunciation" />
        <Legend color="bg-red-100 border-red-400" label="Omission" />
        <Legend color="bg-purple-100 border-purple-400" label="Insertion" />
        <Legend color="bg-gray-200 border-gray-400" label="Unclear" />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={clsx("h-3 w-3 rounded border", color)} />
      {label}
    </span>
  );
}
