const MIN_DURATION_SEC = 30;
const MAX_DURATION_SEC = 45;

export { MIN_DURATION_SEC, MAX_DURATION_SEC };

export function validateDuration(seconds: number): { valid: boolean; message?: string } {
  if (seconds < MIN_DURATION_SEC) {
    return {
      valid: false,
      message: `Recording too short (${seconds.toFixed(1)}s). Minimum is ${MIN_DURATION_SEC} seconds.`,
    };
  }
  if (seconds > MAX_DURATION_SEC) {
    return {
      valid: false,
      message: `Recording too long (${seconds.toFixed(1)}s). Maximum is ${MAX_DURATION_SEC} seconds.`,
    };
  }
  return { valid: true };
}

export async function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio(url);
    audio.addEventListener("loadedmetadata", () => {
      URL.revokeObjectURL(url);
      resolve(audio.duration);
    });
    audio.addEventListener("error", () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read audio file."));
    });
  });
}

export async function getBlobDuration(blob: Blob): Promise<number> {
  const file = new File([blob], "recording.webm", { type: blob.type });
  return getAudioDuration(file);
}
