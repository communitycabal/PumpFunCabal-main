import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSubmissionSchema, insertVoteSchema } from "@shared/schema";
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

      const submission = await storage.createSubmission(data);
      res.status(201).json(submission);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid submission data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create submission" });
      }
    }
  });

  // Vote for a submission
  app.post("/api/submissions/:id/vote", async (req, res) => {
    try {
      const { id } = req.params;
      const voteData = insertVoteSchema.parse({
        submissionId: id,
        voterAddress: req.body.voterAddress
      });

      // Check if user already voted
      if (voteData.voterAddress) {
        const hasVoted = await storage.hasUserVoted(id, voteData.voterAddress);
        if (hasVoted) {
          return res.status(409).json({ message: "User has already voted for this submission" });
        }
      }

      await storage.createVote(voteData);
      
      // Update vote count
      const votes = await storage.getVotesBySubmission(id);
      await storage.updateSubmissionVotes(id, votes.length);

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

  const httpServer = createServer(app);
  return httpServer;
}
