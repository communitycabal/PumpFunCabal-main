import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { storage } from "./storage";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

type RoundPhase = "voting" | "tiebreak";

interface RoundStateFile {
  phase: RoundPhase;
  votingStartMs: number;
  votingDurationSec: number;
  tiebreakEndMs?: number;
  tiebreakCandidates?: { id: string; name: string; symbol: string; address: string; votes: number }[];
}

export class RoundService {
  private filePath: string;
  private state: RoundStateFile;

  constructor(votingDurationSec = 10 * 60) {
    this.filePath = path.resolve(__dirname, "..", "data", "round.json");
    this.ensureDir();
    const loadedState = this.load();
    
    // If no state exists, start fresh
    if (!loadedState) {
      this.state = {
        phase: "voting",
        votingStartMs: Date.now(),
        votingDurationSec,
      };
    } else {
      this.state = loadedState;
      // Check if the voting period has already ended and reset if needed
      const now = Date.now();
      const endMs = this.state.votingStartMs + this.state.votingDurationSec * 1000;
      if (now >= endMs) {
        this.state = {
          phase: "voting",
          votingStartMs: now,
          votingDurationSec,
        };
      }
    }
    this.persist();
  }

  private ensureDir() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  private load(): RoundStateFile | null {
    try {
      if (!fs.existsSync(this.filePath)) return null;
      const raw = fs.readFileSync(this.filePath, "utf-8");
      return JSON.parse(raw) as RoundStateFile;
    } catch {
      return null;
    }
  }

  private persist() {
    fs.writeFileSync(this.filePath, JSON.stringify(this.state, null, 2), "utf-8");
  }

  public getPhase(): RoundPhase {
    return this.state.phase;
  }

  public getVotingRemainingSec(nowMs = Date.now()): number {
    const endMs = this.state.votingStartMs + this.state.votingDurationSec * 1000;
    return Math.max(0, Math.floor((endMs - nowMs) / 1000));
  }

  public getTiebreakRemainingSec(nowMs = Date.now()): number {
    if (this.state.phase !== "tiebreak" || !this.state.tiebreakEndMs) return 0;
    return Math.max(0, Math.floor(((this.state.tiebreakEndMs as number) - nowMs) / 1000));
  }

  public async enterTiebreak(candidates: { id: string; name: string; symbol: string; address: string; votes: number }[], durationSec = 15) {
    this.state.phase = "tiebreak";
    this.state.tiebreakCandidates = candidates;
    this.state.tiebreakEndMs = Date.now() + durationSec * 1000;
    this.persist();
  }

  public async resolveTiebreakAndRestart(): Promise<void> {
    const candidates = this.state.tiebreakCandidates ?? [];
    const winner = candidates[Math.floor(Math.random() * candidates.length)];
    await storage.createPumpHistory({
      submissionId: winner.id,
      tokenName: winner.name,
      tokenSymbol: winner.symbol,
      contractAddress: winner.address,
      amountPumped: "0",
      votes: winner.votes,
      priceImpact: null,
      transactionHash: null,
    });
    await storage.resetAllVotes();
    this.state = {
      phase: "voting",
      votingStartMs: Date.now(),
      votingDurationSec: this.state.votingDurationSec,
    };
    this.persist();
  }

  public async finalizeVotingPickTopOrTie(): Promise<"picked" | "tiebreak" | "none"> {
    const submissions = await storage.getSubmissions();
    if (!submissions.length) {
      this.state = {
        phase: "voting",
        votingStartMs: Date.now(),
        votingDurationSec: this.state.votingDurationSec,
      };
      this.persist();
      return "none";
    }

    const sorted = [...submissions].sort((a, b) => (b.votes || 0) - (a.votes || 0));
    const topVotes = sorted[0].votes || 0;
    const tied = sorted.filter(s => (s.votes || 0) === topVotes);

    if (tied.length <= 1) {
      const winner = sorted[0];
      await storage.createPumpHistory({
        submissionId: winner.id,
        tokenName: winner.tokenName || `Token ${winner.contractAddress.slice(0, 6)}`,
        tokenSymbol: winner.tokenSymbol || "UNK",
        contractAddress: winner.contractAddress,
        amountPumped: "0",
        votes: winner.votes || 0,
        priceImpact: null,
        transactionHash: null,
      });
      await storage.resetAllVotes();
      this.state = {
        phase: "voting",
        votingStartMs: Date.now(),
        votingDurationSec: this.state.votingDurationSec,
      };
      this.persist();
      return "picked";
    }

    const candidates = tied.map(s => ({
      id: s.id,
      name: s.tokenName || `Token ${s.contractAddress.slice(0, 6)}`,
      symbol: s.tokenSymbol || "UNK",
      address: s.contractAddress,
      votes: s.votes || 0,
    }));
    await this.enterTiebreak(candidates, 15);
    return "tiebreak";
  }

  public toDTO(nowMs = Date.now()) {
    if (this.state.phase === "voting") {
      return {
        phase: this.state.phase,
        remainingSeconds: this.getVotingRemainingSec(nowMs),
        votingEndMs: this.state.votingStartMs + this.state.votingDurationSec * 1000,
        votingStartMs: this.state.votingStartMs,
      };
    }
    return {
      phase: this.state.phase,
      remainingSeconds: this.getTiebreakRemainingSec(nowMs),
      tiebreakEndMs: this.state.tiebreakEndMs,
      candidates: this.state.tiebreakCandidates ?? [],
    };
  }
}

// Lazy initialization to avoid circular dependencies
let _roundService: RoundService | null = null;
export const roundService = {
  get instance() {
    if (!_roundService) {
      _roundService = new RoundService(10 * 60);
    }
    return _roundService;
  }
};


