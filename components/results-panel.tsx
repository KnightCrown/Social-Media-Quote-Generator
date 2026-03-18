"use client";

import { ProcessedOutput, QueueItem } from "@/lib/types";

interface ResultsPanelProps {
  items: QueueItem[];
  isDownloadingZip: boolean;
  onDownloadZip: (files: ProcessedOutput[]) => Promise<void>;
}

export function ResultsPanel({ items, isDownloadingZip, onDownloadZip }: ResultsPanelProps) {
  const allOutputs = items.flatMap((item) => item.outputs ?? []);

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

      <ul className="space-y-3">
        {items
          .filter((item) => item.outputs && item.outputs.length > 0)
          .map((item) => (
            <li key={item.id} className="rounded-lg border border-neutral-200 p-3">
              <p className="truncate text-sm font-medium text-neutral-900">{item.file.name}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {item.outputs?.map((output) => (
                  <a
                    key={output.id}
                    href={output.downloadUrl}
                    className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-800 hover:bg-neutral-100"
                  >
                    {output.kind === "story" ? "Story 1080×1920" : "Post 1080×1080"}
                  </a>
                ))}
              </div>
            </li>
          ))}
      </ul>
    </section>
  );
}
