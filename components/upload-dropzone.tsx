"use client";

import { useCallback, useState } from "react";

interface UploadDropzoneProps {
  disabled?: boolean;
  onFilesAdded: (files: File[]) => void;
}

const isImage = (file: File) => file.type.startsWith("image/");

export function UploadDropzone({ disabled, onFilesAdded }: UploadDropzoneProps) {
  const [isOver, setIsOver] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || disabled) {
        return;
      }

      onFilesAdded(Array.from(files).filter(isImage));
    },
    [disabled, onFilesAdded],
  );

  return (
    <label
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) {
          setIsOver(true);
        }
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsOver(false);
        handleFiles(event.dataTransfer.files);
      }}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center transition ${
        isOver ? "border-black bg-neutral-100" : "border-neutral-300 bg-white"
      } ${disabled ? "cursor-not-allowed opacity-60" : "hover:border-black"}`}
    >
      <input
        type="file"
        accept="image/*"
        multiple
        disabled={disabled}
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
      />
      <p className="text-base font-medium text-neutral-900">Drop images here or click to upload</p>
      <p className="mt-1 text-sm text-neutral-500">JPG, PNG, WEBP • up to 10 files</p>
    </label>
  );
}
