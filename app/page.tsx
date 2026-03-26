"use client";

import { useMemo, useState } from "react";

import { ImageQueue } from "@/components/image-queue";
import { OverlayUploader } from "@/components/overlay-uploader";
import { ResultsPanel } from "@/components/results-panel";
import { UploadDropzone } from "@/components/upload-dropzone";
import { CLIENT_LIMITS } from "@/lib/env";
import { OutputMode, ProcessImageResponse, ProcessedOutput, QueueItem } from "@/lib/types";

const MAX_PARALLEL_REQUESTS = 2;

const createQueueItem = (file: File): QueueItem => ({
  id: crypto.randomUUID(),
  file,
  previewUrl: URL.createObjectURL(file),
  status: "idle",
});

const triggerDownload = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

export default function HomePage() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [useOverlay, setUseOverlay] = useState(true);
  const [overlayFile, setOverlayFile] = useState<File | null>(null);
  const [overlayPreview, setOverlayPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [outputMode, setOutputMode] = useState<OutputMode>("both");
  const [error, setError] = useState<string | null>(null);

  const completedCount = useMemo(
    () => queue.filter((item) => item.status === "done").length,
    [queue],
  );

  const hasOutputs = useMemo(
    () => queue.some((item) => (item.outputs?.length ?? 0) > 0),
    [queue],
  );

  const addImages = (files: File[]) => {
    setError(null);

    setQueue((current) => {
      const remainingSlots = CLIENT_LIMITS.maxFiles - current.length;
      if (remainingSlots <= 0) {
        setError(`You can upload up to ${CLIENT_LIMITS.maxFiles} images.`);
        return current;
      }

      const validFiles = files.filter((file) => file.size <= CLIENT_LIMITS.maxFileSizeMb * 1024 * 1024);
      if (validFiles.length !== files.length) {
        setError(`Some files were skipped because they exceed ${CLIENT_LIMITS.maxFileSizeMb}MB.`);
      }

      const nextItems = validFiles.slice(0, remainingSlots).map(createQueueItem);
      return [...current, ...nextItems];
    });
  };

  const handleOverlaySelected = (file: File | null) => {
    setError(null);

    if (!file) {
      setOverlayFile(null);
      setOverlayPreview(null);
      return;
    }

    if (file.type !== "image/png") {
      setError("Overlay must be a PNG file.");
      return;
    }

    setOverlayFile(file);
    setOverlayPreview(URL.createObjectURL(file));
  };

  const updateItem = (id: string, update: Partial<QueueItem>) => {
    setQueue((current) => current.map((item) => (item.id === id ? { ...item, ...update } : item)));
  };

  const processOneImage = async (item: QueueItem) => {
    if (useOverlay && !overlayFile) {
      throw new Error("Overlay is required.");
    }

    updateItem(item.id, { status: "processing", error: undefined, outputs: undefined });

    const body = new FormData();
    body.append("image", item.file);
    if (useOverlay && overlayFile) {
      body.append("overlay", overlayFile);
    }
    body.append("outputMode", outputMode);

    const response = await fetch("/api/process", {
      method: "POST",
      body,
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? "Processing failed.");
    }

    const payload = (await response.json()) as ProcessImageResponse;
    updateItem(item.id, {
      status: "done",
      outputs: payload.outputs,
    });
  };

  const processQueue = async () => {
    setError(null);

    if (useOverlay && !overlayFile) {
      setError("Upload an overlay PNG before processing.");
      return;
    }

    if (queue.length === 0) {
      setError("Upload at least one image.");
      return;
    }

    setIsProcessing(true);

    try {
      let cursor = 0;

      const worker = async () => {
        while (cursor < queue.length) {
          const currentIndex = cursor;
          cursor += 1;
          const item = queue[currentIndex];

          try {
            await processOneImage(item);
          } catch (workerError) {
            const message = workerError instanceof Error ? workerError.message : "Processing failed.";
            updateItem(item.id, { status: "error", error: message });
          }
        }
      };

      const workers = Array.from({ length: Math.min(MAX_PARALLEL_REQUESTS, queue.length) }, () => worker());
      await Promise.all(workers);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadZip = async (files: ProcessedOutput[]) => {
    setIsDownloadingZip(true);

    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          files: files.map((file) => ({ id: file.id, fileName: file.fileName })),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error ?? "ZIP download failed.");
      }

      const blob = await response.blob();
      triggerDownload(blob, "processed-images.zip");
    } catch (zipError) {
      const message = zipError instanceof Error ? zipError.message : "ZIP download failed.";
      setError(message);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const handleDownloadFile = async (file: ProcessedOutput) => {
    try {
      const response = await fetch(file.downloadUrl);

      if (!response.ok) {
        throw new Error("Download failed.");
      }

      const blob = await response.blob();
      triggerDownload(blob, file.fileName);
    } catch (downloadError) {
      const message = downloadError instanceof Error ? downloadError.message : "Download failed.";
      setError(message);
    }
  };

  const moveItem = (id: string, direction: "up" | "down") => {
    setQueue((current) => {
      const index = current.findIndex((item) => item.id === id);
      if (index === -1) {
        return current;
      }

      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= current.length) {
        return current;
      }

      const copy = [...current];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
  };

  const removeItem = (id: string) => {
    setQueue((current) => {
      const found = current.find((item) => item.id === id);
      if (found) {
        URL.revokeObjectURL(found.previewUrl);
      }

      return current.filter((item) => item.id !== id);
    });
  };

  return (
    <main className="mx-auto min-h-screen max-w-5xl space-y-6 px-4 py-8 md:px-6">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold text-neutral-900">Social Media Image Overlay Generator</h1>
        <p className="text-sm text-neutral-600">
          Upload up to 20 images and export Instagram Story (1080×1920)
          and Post (1080×1080) versions, with or without a transparent PNG overlay.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-[1fr_320px]">
        <div className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4">
          <p className="text-sm font-semibold text-neutral-900">Base images</p>
          <UploadDropzone
            disabled={isProcessing || queue.length >= CLIENT_LIMITS.maxFiles}
            onFilesAdded={addImages}
          />
          <ImageQueue items={queue} disabled={isProcessing} onMove={moveItem} onRemove={removeItem} />
        </div>

        <div className="space-y-3">
          <fieldset className="rounded-xl border border-neutral-200 bg-white p-3">
            <legend className="px-1 text-xs font-medium text-neutral-600">Overlay option</legend>
            <div className="mt-1 flex flex-col gap-2 text-sm text-neutral-800">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="overlayMode"
                  checked={useOverlay}
                  onChange={() => setUseOverlay(true)}
                  disabled={isProcessing}
                />
                Use overlay
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="overlayMode"
                  checked={!useOverlay}
                  onChange={() => setUseOverlay(false)}
                  disabled={isProcessing}
                />
                No overlay (resize only)
              </label>
            </div>
          </fieldset>

          {useOverlay ? (
            <OverlayUploader
              overlayPreview={overlayPreview}
              disabled={isProcessing}
              onOverlaySelected={handleOverlaySelected}
            />
          ) : null}

          <fieldset className="rounded-xl border border-neutral-200 bg-white p-3">
            <legend className="px-1 text-xs font-medium text-neutral-600">Create outputs</legend>
            <div className="mt-1 flex flex-wrap gap-4 text-sm text-neutral-800">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="outputMode"
                  value="post"
                  checked={outputMode === "post"}
                  onChange={() => setOutputMode("post")}
                  disabled={isProcessing}
                />
                Post images
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="outputMode"
                  value="story"
                  checked={outputMode === "story"}
                  onChange={() => setOutputMode("story")}
                  disabled={isProcessing}
                />
                Story images
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="outputMode"
                  value="both"
                  checked={outputMode === "both"}
                  onChange={() => setOutputMode("both")}
                  disabled={isProcessing}
                />
                Both
              </label>
            </div>
          </fieldset>

          <button
            type="button"
            onClick={processQueue}
            disabled={isProcessing || queue.length === 0 || (useOverlay && !overlayFile)}
            className="w-full rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {isProcessing ? "Processing..." : "Process Images"}
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-sm text-neutral-700">
          {queue.length} image(s) selected • {completedCount} completed
        </p>
        {hasOutputs ? (
          <ResultsPanel
            items={queue}
            isDownloadingZip={isDownloadingZip}
            onDownloadZip={handleDownloadZip}
            onDownloadFile={handleDownloadFile}
          />
        ) : (
          <div className="rounded-xl border border-neutral-200 bg-white p-6 text-center text-sm text-neutral-500">
            Process images to see output previews and download options.
          </div>
        )}
      </section>

      {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

    </main>
  );
}
