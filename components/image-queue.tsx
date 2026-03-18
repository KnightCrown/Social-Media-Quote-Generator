"use client";

import { QueueItem } from "@/lib/types";

interface ImageQueueProps {
  items: QueueItem[];
  disabled?: boolean;
  onMove: (id: string, direction: "up" | "down") => void;
  onRemove: (id: string) => void;
}

const statusLabel: Record<QueueItem["status"], string> = {
  idle: "Ready",
  processing: "Processing...",
  done: "Done",
  error: "Error",
};

export function ImageQueue({ items, disabled, onMove, onRemove }: ImageQueueProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-6 text-center text-sm text-neutral-500">
        Upload images to start.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li key={item.id} className="rounded-xl border border-neutral-200 bg-white p-3">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.previewUrl} alt={item.file.name} className="h-16 w-16 rounded-md object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-neutral-900">{item.file.name}</p>
              <p className="text-xs text-neutral-500">{statusLabel[item.status]}</p>
              {item.error ? <p className="text-xs text-red-600">{item.error}</p> : null}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onMove(item.id, "up")}
                disabled={disabled || index === 0}
                className="rounded-md border border-neutral-300 px-2 py-1 text-xs disabled:opacity-40"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => onMove(item.id, "down")}
                disabled={disabled || index === items.length - 1}
                className="rounded-md border border-neutral-300 px-2 py-1 text-xs disabled:opacity-40"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                disabled={disabled}
                className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-700 disabled:opacity-40"
              >
                Remove
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
