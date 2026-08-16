const MIN_DURATION_SEC = 10;
const MAX_DURATION_SEC = 180; // 3 minutes

export { MIN_DURATION_SEC, MAX_DURATION_SEC };

export function validateDuration(seconds: number): { valid: boolean; message?: string } {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return {
      valid: false,
      message: "Could not read recording length. Please try again.",
    };
  }
  if (seconds < MIN_DURATION_SEC) {
    return {
      valid: false,
      message: `Recording too short (${seconds.toFixed(1)}s). Speak for at least ${MIN_DURATION_SEC} seconds.`,
    };
  }
  if (seconds > MAX_DURATION_SEC + 1) {
    // +1s tolerance for timer/blob rounding
    return {
      valid: false,
      message: `Recording too long (${formatDuration(seconds)}). Maximum is 3 minutes.`,
    };
  }
  return { valid: true };
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds)) return "unknown";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m <= 0) return `${s}s`;
  return `${m}m ${s}s`;
}

/** Read duration; WebM from MediaRecorder often reports Infinity until seeked. */
export async function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const audio = document.createElement("audio");
    audio.preload = "metadata";

    const cleanup = () => {
      URL.revokeObjectURL(url);
      audio.removeAttribute("src");
      audio.load();
    };

    audio.addEventListener("loadedmetadata", () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        const d = audio.duration;
        cleanup();
        resolve(d);
        return;
      }
      // Chrome MediaRecorder WebM: force duration calculation
      audio.currentTime = 1e101;
      audio.addEventListener(
        "timeupdate",
        () => {
          const d = audio.duration;
          cleanup();
          resolve(Number.isFinite(d) && d > 0 ? d : 0);
        },
        { once: true }
      );
    });

    audio.addEventListener("error", () => {
      cleanup();
      reject(new Error("Could not read audio file."));
    });

    audio.src = url;
  });
}

export async function getBlobDuration(blob: Blob): Promise<number> {
  const file = new File([blob], "recording.webm", { type: blob.type || "audio/webm" });
  return getAudioDuration(file);
}
