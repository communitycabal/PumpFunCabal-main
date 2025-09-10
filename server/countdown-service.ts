import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface CountdownStateFile {
  startTimestampMs: number;
}

export class CountdownService {
  private readonly durationSeconds: number;
  private readonly stateFilePath: string;
  private startTimestampMs: number | null;

  constructor(durationSeconds: number = 10 * 60) {
    this.durationSeconds = durationSeconds;
    this.stateFilePath = path.resolve(__dirname, "..", "data", "countdown.json");
    this.startTimestampMs = null;
    this.ensureStorageDir();
    this.loadOrInitialize();
  }

  private ensureStorageDir(): void {
    const dir = path.dirname(this.stateFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private loadOrInitialize(): void {
    try {
      if (fs.existsSync(this.stateFilePath)) {
        const raw = fs.readFileSync(this.stateFilePath, "utf-8");
        const parsed: CountdownStateFile = JSON.parse(raw);
        if (typeof parsed.startTimestampMs === "number" && parsed.startTimestampMs > 0) {
          this.startTimestampMs = parsed.startTimestampMs;
          return;
        }
      }
    } catch {}

    // Initialize on first run
    this.startTimestampMs = Date.now();
    this.persist();
  }

  private persist(): void {
    const data: CountdownStateFile = {
      startTimestampMs: this.startTimestampMs as number,
    };
    fs.writeFileSync(this.stateFilePath, JSON.stringify(data, null, 2), "utf-8");
  }

  public getStartTimestampMs(): number {
    return this.startTimestampMs as number;
  }

  public getEndTimestampMs(): number {
    return this.getStartTimestampMs() + this.durationSeconds * 1000;
  }

  public getRemainingSeconds(nowMs: number = Date.now()): number {
    const remainingMs = this.getEndTimestampMs() - nowMs;
    return Math.max(0, Math.floor(remainingMs / 1000));
  }

  public resetStart(nowMs: number = Date.now()): void {
    this.startTimestampMs = nowMs;
    this.persist();
  }
}

export const countdownService = new CountdownService(10 * 60);


