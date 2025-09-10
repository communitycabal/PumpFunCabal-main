import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { countdownService } from "./countdown-service";
import { roundService } from "./round-service";
import { insertSubmissionSchema, insertVoteSchema } from "@shared/schema";
import { tokenService } from "./token-service";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all submissions
  app.get("/api/submissions", async (req, res) => {
    try {
      const submissions = await storage.getSubmissions();
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  // Submit new contract address
  app.post("/api/submissions", async (req, res) => {
    try {
      const data = insertSubmissionSchema.parse(req.body);
      
      // Check if address already exists
      const existingSubmission = await storage.getSubmissionByAddress(data.contractAddress);
      if (existingSubmission) {
        return res.status(409).json({ 
          message: "Contract address already submitted",
          submissionId: existingSubmission.id
        });
      }

      // Try to fetch real token metadata
      const tokenMetadata = await tokenService.getTokenMetadataWithFallback(data.contractAddress);
      
      // Use real data if available, otherwise use submitted data or fallback
      const submissionData = {
        ...data,
        tokenName: tokenMetadata?.name || data.tokenName || `Token ${data.contractAddress.slice(0, 6)}`,
        tokenSymbol: tokenMetadata?.symbol || data.tokenSymbol || 'UNK'
      };

      const submission = await storage.createSubmission(submissionData);
      res.status(201).json({
        ...submission,
        metadata: tokenMetadata ? {
          source: 'api',
          logo: tokenMetadata.logo
        } : {
          source: 'fallback'
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid submission data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create submission" });
      }
    }
  });

  // Simple in-memory rate limiter: allow one vote per voter per submission every 10 seconds
  const lastVoteByKey = new Map<string, number>();

  // Vote for a submission
  app.post("/api/submissions/:id/vote", async (req, res) => {
    try {
      const { id } = req.params;
      const voteData = insertVoteSchema.parse({
        submissionId: id,
        voterAddress: req.body.voterAddress
      });

      // Enforce 10s cooldown per voter per submission
      const voterKey = `${id}:${voteData.voterAddress || 'anon'}`;
      const now = Date.now();
      const last = lastVoteByKey.get(voterKey) || 0;
      const diff = now - last;
      const cooldownMs = 10_000;
      if (diff < cooldownMs) {
        const retryAfterSeconds = Math.ceil((cooldownMs - diff) / 1000);
        return res.status(429).json({ message: "Rate limited: vote again later", retryAfterSeconds });
      }

      await storage.createVote(voteData);
      
      // Update vote count
      const votes = await storage.getVotesBySubmission(id);
      await storage.updateSubmissionVotes(id, votes.length);

      // Record last vote time
      lastVoteByKey.set(voterKey, now);

      res.json({ message: "Vote recorded successfully", voteCount: votes.length });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid vote data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to record vote" });
      }
    }
  });

  // Get pump history
  app.get("/api/pump-history", async (req, res) => {
    try {
      const history = await storage.getPumpHistory();
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pump history" });
    }
  });

  // Get statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const submissions = await storage.getSubmissions();
      const totalVotes = submissions.reduce((sum, submission) => sum + (submission.votes || 0), 0);
      
      res.json({
        totalPool: 12.4, // Mock value - would come from blockchain
        totalVotes,
        submissionCount: submissions.length
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Countdown status
  app.get("/api/countdown", async (_req, res) => {
    try {
      const now = Date.now();
      const remainingSeconds = countdownService.getRemainingSeconds(now);
      res.json({
        startTimestampMs: countdownService.getStartTimestampMs(),
        endTimestampMs: countdownService.getEndTimestampMs(),
        nowTimestampMs: now,
        remainingSeconds,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch countdown" });
    }
  });

  // Round status (phase and remaining)
  app.get("/api/round", (_req, res) => {
    try {
      res.json(roundService.instance.toDTO());
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch round" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
