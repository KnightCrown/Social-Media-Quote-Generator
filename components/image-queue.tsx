"use client";

import { QueueItem } from "@/lib/types";

interface ImageQueueProps {
  items: QueueItem[];
  disabled?: boolean;
  onRemove: (id: string) => void;
}

const statusLabel: Record<QueueItem["status"], string> = {
  idle: "Ready",
  processing: "Processing...",
  done: "Done",
  error: "Error",
};

export function ImageQueue({ items, disabled, onRemove }: ImageQueueProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-6 text-center text-sm text-neutral-500">
        Upload images to start.
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map((item, index) => (
        <li key={item.id} className="space-y-2 rounded-xl border border-neutral-200 bg-white p-2">
          <div className="relative overflow-hidden rounded-lg border border-neutral-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.previewUrl} alt={item.file.name} className="aspect-square w-full object-cover" />

            <div className="absolute bottom-2 right-2 rounded-md bg-black/45 p-1">
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                disabled={disabled}
                className="h-7 w-7 rounded-md bg-red-50 text-xs font-semibold text-red-700 disabled:opacity-40"
                aria-label={`Remove ${item.file.name}`}
              >
                ×
              </button>
            </div>
          </div>

          <div className="min-w-0 px-1 pb-1">
            <p className="truncate text-xs font-medium text-neutral-900">{item.file.name}</p>
            <p className="text-xs text-neutral-500">{statusLabel[item.status]}</p>
            {item.error ? <p className="text-xs text-red-600">{item.error}</p> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
