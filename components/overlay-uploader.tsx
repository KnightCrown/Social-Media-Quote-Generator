"use client";

import { ReactNode } from "react";

interface OverlayUploaderProps {
  overlayPreview: string | null;
  disabled?: boolean;
  onOverlaySelected: (file: File | null) => void;
  children?: ReactNode;
}

export function OverlayUploader({ overlayPreview, disabled, onOverlaySelected, children }: OverlayUploaderProps) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="mb-3">
        <p className="text-sm font-semibold text-neutral-900">Overlay (PNG, transparent)</p>
        <p className="text-xs text-neutral-500">Applied above every output image</p>
      </div>

      <input
        type="file"
        accept="image/png"
        disabled={disabled}
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null;
          onOverlaySelected(file);
        }}
        className="block w-full cursor-pointer rounded-lg border border-neutral-300 p-2 text-sm text-neutral-700"
      />

      <div className="mt-4 flex min-h-[140px] items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 p-3">
        {overlayPreview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={overlayPreview} alt="Overlay preview" className="max-h-32 max-w-full object-contain" />
        ) : (
          <p className="text-xs text-neutral-500">No overlay selected</p>
        )}
      </div>

      {children ? <div className="mt-4 space-y-3">{children}</div> : null}
    </div>
  );
}
