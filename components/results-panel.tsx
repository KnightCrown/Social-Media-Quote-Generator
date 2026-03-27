"use client";

import { useState } from "react";

import { ProcessedOutput, QueueItem } from "@/lib/types";

interface ResultsPanelProps {
  items: QueueItem[];
  isDownloadingZip: boolean;
  onDownloadZip: (files: ProcessedOutput[]) => Promise<void>;
  onDownloadFile: (file: ProcessedOutput) => Promise<void>;
}

export function ResultsPanel({ items, isDownloadingZip, onDownloadZip, onDownloadFile }: ResultsPanelProps) {
  const allOutputs = items.flatMap((item) => item.outputs ?? []);
  const resultsBySource = items
    .filter((item) => item.outputs && item.outputs.length > 0)
    .flatMap((item) =>
      (item.outputs ?? []).map((output) => ({
        output,
        sourceName: item.file.name,
      })),
    );
  const [previewOutput, setPreviewOutput] = useState<ProcessedOutput | null>(null);

  if (allOutputs.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4 rounded-xl border border-neutral-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-neutral-900">Downloads</p>
        <button
          type="button"
          onClick={() => onDownloadZip(allOutputs)}
          disabled={isDownloadingZip}
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isDownloadingZip ? "Preparing ZIP..." : "Download ZIP"}
        </button>
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {resultsBySource.map(({ output, sourceName }) => (
          <li key={output.id} className="rounded-lg border border-neutral-200 p-3">
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setPreviewOutput(output)}
                className="block w-full rounded-md border border-neutral-300 p-1 hover:bg-neutral-100"
                aria-label={`Preview ${output.fileName}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={output.downloadUrl} alt={output.fileName} className="h-36 w-full rounded object-cover" />
              </button>
              <p className="truncate text-xs font-medium text-neutral-800" title={sourceName}>
                {sourceName}
              </p>
              <p className="text-xs text-neutral-600">
                {output.kind === "story" ? "Story 1080×1920" : "Post 1080×1080"}
              </p>
              <button
                type="button"
                onClick={() => onDownloadFile(output)}
                className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-800 hover:bg-neutral-100"
              >
                Download image
              </button>
            </div>
          </li>
        ))}
      </ul>

      {previewOutput ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          onClick={() => setPreviewOutput(null)}
        >
          <button
            type="button"
            onClick={() => setPreviewOutput(null)}
            className="absolute right-4 top-4 rounded-md border border-neutral-200 bg-white px-2 py-1 text-sm"
          >
            Close
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewOutput.downloadUrl}
            alt={previewOutput.fileName}
            className="max-h-[85vh] max-w-full rounded-lg border border-neutral-200 bg-white object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      ) : null}
    </section>
  );
}
