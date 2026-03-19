export type OutputKind = "story" | "post";
export type OutputMode = OutputKind | "both";

export type QueueStatus = "idle" | "processing" | "done" | "error";

export interface ProcessedOutput {
  id: string;
  kind: OutputKind;
  width: number;
  height: number;
  fileName: string;
  downloadUrl: string;
}

export interface ProcessImageResponse {
  inputName: string;
  outputs: ProcessedOutput[];
}

export interface ZipRequestFile {
  id: string;
  fileName: string;
}

export interface QueueItem {
  id: string;
  file: File;
  previewUrl: string;
  status: QueueStatus;
  error?: string;
  outputs?: ProcessedOutput[];
}
