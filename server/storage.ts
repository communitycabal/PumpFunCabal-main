import { type Submission, type InsertSubmission, type Vote, type InsertVote, type PumpHistory, type InsertPumpHistory } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Submissions
  getSubmissions(): Promise<Submission[]>;
  getSubmissionByAddress(contractAddress: string): Promise<Submission | undefined>;
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  updateSubmissionVotes(id: string, votes: number): Promise<void>;
  
  // Votes
  createVote(vote: InsertVote): Promise<Vote>;
  getVotesBySubmission(submissionId: string): Promise<Vote[]>;
  hasUserVoted(submissionId: string, voterAddress: string): Promise<boolean>;
  
  // Pump History
  getPumpHistory(): Promise<PumpHistory[]>;
  createPumpHistory(pumpHistory: InsertPumpHistory): Promise<PumpHistory>;
}

export class MemStorage implements IStorage {
  private submissions: Map<string, Submission>;
  private votes: Map<string, Vote>;
  private pumpHistory: Map<string, PumpHistory>;

  constructor() {
    this.submissions = new Map();
    this.votes = new Map();
    this.pumpHistory = new Map();
  }

  async getSubmissions(): Promise<Submission[]> {
    return Array.from(this.submissions.values()).sort((a, b) => b.votes! - a.votes!);
  }

  async getSubmissionByAddress(contractAddress: string): Promise<Submission | undefined> {
    return Array.from(this.submissions.values()).find(
      (submission) => submission.contractAddress === contractAddress
    );
  }

  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    const id = randomUUID();
    const submission: Submission = { 
      ...insertSubmission,
      tokenName: insertSubmission.tokenName || null,
      tokenSymbol: insertSubmission.tokenSymbol || null,
      submittedBy: insertSubmission.submittedBy || null,
      id,
      votes: 0,
      createdAt: new Date()
    };
    this.submissions.set(id, submission);
    return submission;
  }

  async updateSubmissionVotes(id: string, votes: number): Promise<void> {
    const submission = this.submissions.get(id);
    if (submission) {
      submission.votes = votes;
      this.submissions.set(id, submission);
    }
  }

  async createVote(insertVote: InsertVote): Promise<Vote> {
    const id = randomUUID();
    const vote: Vote = { 
      ...insertVote,
      voterAddress: insertVote.voterAddress || null,
      id,
      createdAt: new Date()
    };
    this.votes.set(id, vote);
    return vote;
  }

  async getVotesBySubmission(submissionId: string): Promise<Vote[]> {
    return Array.from(this.votes.values()).filter(
      (vote) => vote.submissionId === submissionId
    );
  }

  async hasUserVoted(submissionId: string, voterAddress: string): Promise<boolean> {
    return Array.from(this.votes.values()).some(
      (vote) => vote.submissionId === submissionId && vote.voterAddress === voterAddress
    );
  }

  async getPumpHistory(): Promise<PumpHistory[]> {
    return Array.from(this.pumpHistory.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async createPumpHistory(insertPumpHistory: InsertPumpHistory): Promise<PumpHistory> {
    const id = randomUUID();
    const pumpHistoryEntry: PumpHistory = { 
      ...insertPumpHistory,
      tokenSymbol: insertPumpHistory.tokenSymbol || null,
      priceImpact: insertPumpHistory.priceImpact || null,
      transactionHash: insertPumpHistory.transactionHash || null,
      id,
      createdAt: new Date()
    };
    this.pumpHistory.set(id, pumpHistoryEntry);
    return pumpHistoryEntry;
  }
}

export const storage = new MemStorage();
