"use client";

import { useEffect, useState } from "react";

interface ConsentModalProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export default function ConsentModal({ open, onAccept, onDecline }: ConsentModalProps) {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (open) setChecked(false);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        role="dialog"
        aria-labelledby="consent-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
      >
        <h2 id="consent-title" className="text-xl font-bold text-gray-900">
          Data Processing Consent (DPDP Act 2023)
        </h2>

        <div className="mt-4 space-y-3 text-sm leading-relaxed text-gray-700">
          <p>
            <strong>What we collect:</strong> Up to 3 minutes of your English speech,
            processed for pronunciation scoring.
          </p>
          <p>
            <strong>Why:</strong> To analyze your pronunciation and provide word-level feedback.
            Audio is used <em>only</em> for this single scoring request.
          </p>
          <p>
            <strong>What we store:</strong> Your score, transcript, and word-level feedback —
            linked to a random session ID only. <strong>Raw audio is never stored</strong> on any
            server or database.
          </p>
          <p>
            <strong>How long:</strong> Results are kept for 30 days, then automatically deleted.
            You can delete them immediately using &ldquo;Delete my results.&rdquo;
          </p>
          <p>
            <strong>No account required.</strong> We do not collect your name, email, or any
            personally identifiable information.
          </p>
          <p>
            <strong>Privacy:</strong> Your recording is processed for scoring only. Results are
            stored securely and are not shared with third parties.
          </p>
        </div>

        <label className="mt-5 flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
          />
          <span className="text-sm text-gray-800">
            I understand and consent to the processing described above.
          </span>
        </label>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onAccept}
            disabled={!checked}
            className="flex-1 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Accept &amp; Continue
          </button>
          <button
            onClick={onDecline}
            className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
