import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const submissions = pgTable("submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractAddress: text("contract_address").notNull().unique(),
  tokenName: text("token_name"),
  tokenSymbol: text("token_symbol"), 
  submittedBy: text("submitted_by"),
  votes: integer("votes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const votes = pgTable("votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  submissionId: varchar("submission_id").notNull(),
  voterAddress: text("voter_address"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pumpHistory = pgTable("pump_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  submissionId: varchar("submission_id").notNull(),
  tokenName: text("token_name").notNull(),
  tokenSymbol: text("token_symbol"),
  contractAddress: text("contract_address").notNull(),
  amountPumped: text("amount_pumped").notNull(),
  votes: integer("votes").notNull(),
  priceImpact: text("price_impact"),
  transactionHash: text("transaction_hash"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSubmissionSchema = createInsertSchema(submissions).omit({
  id: true,
  votes: true,
  createdAt: true,
});

export const insertVoteSchema = createInsertSchema(votes).omit({
  id: true,
  createdAt: true,
});

export const insertPumpHistorySchema = createInsertSchema(pumpHistory).omit({
  id: true,
  createdAt: true,
});

export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Submission = typeof submissions.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;
export type Vote = typeof votes.$inferSelect;
export type InsertPumpHistory = z.infer<typeof insertPumpHistorySchema>;
export type PumpHistory = typeof pumpHistory.$inferSelect;
