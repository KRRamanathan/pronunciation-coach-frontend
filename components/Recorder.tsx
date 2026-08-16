"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getBlobDuration, MAX_DURATION_SEC, MIN_DURATION_SEC, validateDuration } from "@/lib/audioValidation";

interface RecorderProps {
  disabled?: boolean;
  onRecordingReady: (file: File) => void;
  onError: (message: string) => void;
}

export default function Recorder({ disabled, onRecordingReady, onError }: RecorderProps) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [uploadName, setUploadName] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const elapsedRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      stopStream();
    };
  }, [stopStream]);

  const processFile = async (file: File, fallbackSeconds?: number) => {
    try {
      let duration = await getBlobDuration(file);
      if (!Number.isFinite(duration) || duration <= 0) {
        duration = fallbackSeconds ?? 0;
      }
      const check = validateDuration(duration);
      if (!check.valid) {
        onError(check.message!);
        return;
      }
      setUploadName(file.name);
      onRecordingReady(file);
    } catch {
      if (fallbackSeconds && Number.isFinite(fallbackSeconds)) {
        const check = validateDuration(fallbackSeconds);
        if (check.valid) {
          setUploadName(file.name);
          onRecordingReady(file);
          return;
        }
        onError(check.message!);
        return;
      }
      onError("Could not validate audio duration.");
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stopStream();
        const recordedSec = elapsedRef.current;
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const file = new File([blob], `recording-${Date.now()}.webm`, { type: mimeType });
        await processFile(file, recordedSec);
      };

      recorder.start(250);
      setRecording(true);
      setElapsed(0);
      elapsedRef.current = 0;
      setUploadName(null);

      timerRef.current = window.setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 0.25;
          elapsedRef.current = next;
          if (next >= MAX_DURATION_SEC) {
            stopRecording();
          }
          return next;
        });
      }, 250);
    } catch {
      onError("Microphone access denied. Please allow microphone permission.");
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["audio/wav", "audio/mpeg", "audio/mp4", "audio/webm", "audio/ogg", "audio/x-wav"];
    if (!allowed.some((t) => file.type.startsWith(t.split("/")[0]) || file.type === t)) {
      onError("Unsupported format. Use WAV, MP3, M4A, or WebM.");
      return;
    }
    await processFile(file);
    e.target.value = "";
  };

  const progress = Math.min(100, (elapsed / MAX_DURATION_SEC) * 100);
  const canStop = recording && elapsed >= MIN_DURATION_SEC;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">Record or Upload</h3>
      <p className="mt-1 text-sm text-gray-500">
        Speak for at least {MIN_DURATION_SEC} seconds, up to 3 minutes.
      </p>

      {recording && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-red-600">● Recording {elapsed.toFixed(1)}s</span>
            <span className="text-gray-500">Max 3 min</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-red-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {uploadName && !recording && (
        <p className="mt-3 text-sm text-green-700">✓ Ready: {uploadName}</p>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        {!recording ? (
          <button
            onClick={startRecording}
            disabled={disabled}
            className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
          >
            🎙 Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            disabled={!canStop}
            className="rounded-xl bg-gray-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-900 disabled:opacity-50"
          >
            ⏹ Stop {canStop ? "" : `(wait ${Math.max(0, MIN_DURATION_SEC - elapsed).toFixed(0)}s)`}
          </button>
        )}

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || recording}
          className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          📁 Upload Audio
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/wav,audio/mpeg,audio/mp4,audio/webm,audio/ogg,audio/opus,.wav,.mp3,.m4a,.webm,.ogg,.opus"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>
    </div>
  );
}
