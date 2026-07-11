export function isScreenCaptureSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getDisplayMedia
  );
}

// Opens the browser's native "choose what to share" dialog, grabs a single
// frame from the shared window/tab/screen, then immediately stops sharing.
// Returns null if the user cancels the picker.
export async function captureScreenshot(): Promise<File | null> {
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
  } catch {
    return null;
  }

  try {
    const video = document.createElement("video");
    video.srcObject = stream;
    video.muted = true;
    await video.play();
    // Give the video element a moment to receive its first frame.
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")!.drawImage(video, 0, 0);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );
    if (!blob) return null;

    return new File([blob], `capture-${Date.now()}.png`, { type: "image/png" });
  } finally {
    stream.getTracks().forEach((track) => track.stop());
  }
}
