import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  decimal,
  integer,
  boolean,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  username: varchar("username").unique(),
  telegramId: varchar("telegram_id").unique(),
  phone: varchar("phone"),
  paymentMethod: varchar("payment_method"),
  paymentNumber: varchar("payment_number"),
  binanceEmail: varchar("binance_email"),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0.00"),
  totalEarned: decimal("total_earned", { precision: 10, scale: 2 }).default("0.00"),
  totalWithdrawn: decimal("total_withdrawn", { precision: 10, scale: 2 }).default("0.00"),
  referralCode: varchar("referral_code").unique(),
  referredBy: varchar("referred_by"),
  isActive: boolean("is_active").default(true),
  isBanned: boolean("is_banned").default(false),
  isPremium: boolean("is_premium").default(false),
  isAdmin: boolean("is_admin").default(false),
  password: varchar("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Account categories and rates
export const categoryRates = pgTable("category_rates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  category: varchar("category").notNull().unique(),
  subcategory: varchar("subcategory"),
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// File submissions
export const files = pgTable("files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  filename: varchar("filename").notNull(),
  category: varchar("category").notNull(),
  subcategory: varchar("subcategory"),
  accountCount: integer("account_count").notNull(),
  approvedCount: integer("approved_count").default(0),
  status: varchar("status").default("pending"), // pending, approved, rejected
  submissionMethod: varchar("submission_method").default("web"),
  fileContent: text("file_content"),
  ratePerAccount: decimal("rate_per_account", { precision: 10, scale: 2 }),
  totalEarning: decimal("total_earning", { precision: 10, scale: 2 }).default("0.00"),
  sheetUrl: text("sheet_url"),
  uploadedToSheet: boolean("uploaded_to_sheet").default(false),
  adminNotes: text("admin_notes"),
  fileCounter: varchar("file_counter").unique(),
  uploadDate: timestamp("upload_date").defaultNow(),
  approvedDate: timestamp("approved_date"),
});

// Account reports for status verification
export const accountReports = pgTable("account_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  uid: varchar("uid").notNull(),
  category: varchar("category").notNull(),
  status: varchar("status").notNull(), // good, suspended, wrong_password, not_found, unknown
  submitterId: varchar("submitter_id"),
  fileId: varchar("file_id"),
  adminNotes: text("admin_notes"),
  reportDate: timestamp("report_date").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Referral system
export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: varchar("referrer_id").notNull(),
  referredId: varchar("referred_id").notNull(),
  level: integer("level").notNull(), // 1-5 for MLM levels
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).notNull(),
  totalCommission: decimal("total_commission", { precision: 10, scale: 2 }).default("0.00"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Commission transactions
export const commissions = pgTable("commissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  fromUserId: varchar("from_user_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  level: integer("level").notNull(),
  transactionType: varchar("transaction_type").default("commission"), // commission, bonus
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Withdrawals
export const withdrawals = pgTable("withdrawals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method").notNull(),
  paymentDetails: jsonb("payment_details"),
  status: varchar("status").default("pending"), // pending, approved, rejected, completed
  transactionId: varchar("transaction_id"),
  adminNotes: text("admin_notes"),
  requestedAt: timestamp("requested_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

// Quiz system
export const quizzes = pgTable("quizzes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  questions: jsonb("questions").notNull(), // Array of question objects
  totalQuestions: integer("total_questions").notNull(),
  timeLimit: integer("time_limit"), // in minutes
  rewardAmount: decimal("reward_amount", { precision: 10, scale: 2 }).default("0.00"),
  isActive: boolean("is_active").default(true),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Quiz attempts
export const quizAttempts = pgTable("quiz_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  quizId: varchar("quiz_id").notNull(),
  answers: jsonb("answers").notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
  rewardEarned: decimal("reward_earned", { precision: 10, scale: 2 }).default("0.00"),
});

// Islamic reminders
export const islamicReminders = pgTable("islamic_reminders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  source: varchar("source"), // Quran, Hadith, etc.
  isActive: boolean("is_active").default(true),
  displayDate: timestamp("display_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// System notices
export const notices = pgTable("notices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  type: varchar("type").default("info"), // info, warning, success, error
  targetAudience: varchar("target_audience").default("all"), // all, premium, admin
  priority: integer("priority").default(0),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// System settings
export const systemSettings = pgTable("system_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key").notNull().unique(),
  value: text("value").notNull(),
  dataType: varchar("data_type").default("string"), // string, number, boolean, json
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  files: many(files),
  referralsGiven: many(referrals, { relationName: "referrer" }),
  referralsReceived: many(referrals, { relationName: "referred" }),
  commissions: many(commissions),
  withdrawals: many(withdrawals),
  quizAttempts: many(quizAttempts),
  accountReports: many(accountReports),
  referrer: one(users, {
    fields: [users.referredBy],
    references: [users.referralCode],
  }),
}));

export const filesRelations = relations(files, ({ one }) => ({
  user: one(users, {
    fields: [files.userId],
    references: [users.id],
  }),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, {
    fields: [referrals.referrerId],
    references: [users.id],
    relationName: "referrer",
  }),
  referred: one(users, {
    fields: [referrals.referredId],
    references: [users.id],
    relationName: "referred",
  }),
}));

export const commissionsRelations = relations(commissions, ({ one }) => ({
  user: one(users, {
    fields: [commissions.userId],
    references: [users.id],
  }),
  fromUser: one(users, {
    fields: [commissions.fromUserId],
    references: [users.id],
  }),
}));

export const withdrawalsRelations = relations(withdrawals, ({ one }) => ({
  user: one(users, {
    fields: [withdrawals.userId],
    references: [users.id],
  }),
}));

export const quizAttemptsRelations = relations(quizAttempts, ({ one }) => ({
  user: one(users, {
    fields: [quizAttempts.userId],
    references: [users.id],
  }),
  quiz: one(quizzes, {
    fields: [quizAttempts.quizId],
    references: [quizzes.id],
  }),
}));

export const accountReportsRelations = relations(accountReports, ({ one }) => ({
  submitter: one(users, {
    fields: [accountReports.submitterId],
    references: [users.id],
  }),
  file: one(files, {
    fields: [accountReports.fileId],
    references: [files.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFileSchema = createInsertSchema(files).omit({
  id: true,
  uploadDate: true,
  approvedDate: true,
  fileCounter: true,
});

export const insertCategoryRateSchema = createInsertSchema(categoryRates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuizSchema = createInsertSchema(quizzes).omit({
  id: true,
  createdAt: true,
});

export const insertWithdrawalSchema = createInsertSchema(withdrawals).omit({
  id: true,
  requestedAt: true,
  processedAt: true,
});

export const insertNoticeSchema = createInsertSchema(notices).omit({
  id: true,
  createdAt: true,
});

export const insertIslamicReminderSchema = createInsertSchema(islamicReminders).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type File = typeof files.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;
export type CategoryRate = typeof categoryRates.$inferSelect;
export type InsertCategoryRate = z.infer<typeof insertCategoryRateSchema>;
export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type Withdrawal = typeof withdrawals.$inferSelect;
export type InsertWithdrawal = z.infer<typeof insertWithdrawalSchema>;
export type Notice = typeof notices.$inferSelect;
export type InsertNotice = z.infer<typeof insertNoticeSchema>;
export type IslamicReminder = typeof islamicReminders.$inferSelect;
export type InsertIslamicReminder = z.infer<typeof insertIslamicReminderSchema>;
export type AccountReport = typeof accountReports.$inferSelect;
export type Referral = typeof referrals.$inferSelect;
export type Commission = typeof commissions.$inferSelect;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type SystemSetting = typeof systemSettings.$inferSelect;
