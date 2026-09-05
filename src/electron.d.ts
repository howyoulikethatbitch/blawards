export {};

declare global {
  interface Window {
    blAwards?: {
      platform: string;
      version: string;
      updater?: {
        check: () => Promise<{ ok: boolean }>;
        download: () => Promise<{ ok: boolean }>;
        install: () => Promise<{ ok: boolean }>;
        onStatus: (listener: (status: UpdateStatus) => void) => () => void;
      };
    };
  }
}

export type UpdateStatus =
  | { state: "checking" | "current" | "error" }
  | { state: "available"; version: string }
  | { state: "downloading"; percent: number }
  | { state: "downloaded"; version: string };