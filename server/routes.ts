import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertFileSchema, insertWithdrawalSchema, insertQuizSchema, insertNoticeSchema } from "@shared/schema";
import { firebaseService } from "./services/firebase";
import { sheetsService } from "./services/sheets";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Account categories and rates
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategoryRates();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Update category rates (admin only)
  app.put('/api/categories/:category', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { category } = req.params;
      const { rate, isActive } = req.body;
      
      await storage.updateCategoryRate(category, rate, isActive);
      res.json({ message: "Category rate updated successfully" });
    } catch (error) {
      console.error("Error updating category rate:", error);
      res.status(500).json({ message: "Failed to update category rate" });
    }
  });

  // File submission
  app.post('/api/files/submit', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertFileSchema.safeParse({
        ...req.body,
        userId,
      });

      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid data", 
          errors: validation.error.errors 
        });
      }

      const file = await storage.submitFile(validation.data);
      
      // Upload to Google Sheets asynchronously
      sheetsService.uploadAccountData(file).catch(console.error);
      
      res.json(file);
    } catch (error) {
      console.error("Error submitting file:", error);
      res.status(500).json({ message: "Failed to submit file" });
    }
  });

  // Get user files
  app.get('/api/files', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const files = await storage.getUserFiles(userId);
      res.json(files);
    } catch (error) {
      console.error("Error fetching files:", error);
      res.status(500).json({ message: "Failed to fetch files" });
    }
  });

  // Account verification
  app.post('/api/accounts/verify', isAuthenticated, async (req: any, res) => {
    try {
      const { uids, reportDate } = req.body;
      
      if (!Array.isArray(uids) || uids.length === 0) {
        return res.status(400).json({ message: "UIDs array is required" });
      }

      if (uids.length > 1000) {
        return res.status(400).json({ message: "Maximum 1000 UIDs allowed per request" });
      }

      const results = await storage.verifyAccounts(uids, reportDate);
      res.json(results);
    } catch (error) {
      console.error("Error verifying accounts:", error);
      res.status(500).json({ message: "Failed to verify accounts" });
    }
  });

  // Referral system
  app.get('/api/referrals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const referralData = await storage.getReferralData(userId);
      res.json(referralData);
    } catch (error) {
      console.error("Error fetching referral data:", error);
      res.status(500).json({ message: "Failed to fetch referral data" });
    }
  });

  // Quiz system
  app.get('/api/quiz/daily', isAuthenticated, async (req: any, res) => {
    try {
      const quiz = await storage.getDailyQuiz();
      res.json(quiz);
    } catch (error) {
      console.error("Error fetching daily quiz:", error);
      res.status(500).json({ message: "Failed to fetch daily quiz" });
    }
  });

  app.post('/api/quiz/submit', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { quizId, answers } = req.body;
      
      const result = await storage.submitQuizAttempt(userId, quizId, answers);
      res.json(result);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      res.status(500).json({ message: "Failed to submit quiz" });
    }
  });

  app.get('/api/quiz/leaderboard', isAuthenticated, async (req: any, res) => {
    try {
      const leaderboard = await storage.getQuizLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Withdrawal requests
  app.post('/api/withdrawals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertWithdrawalSchema.safeParse({
        ...req.body,
        userId,
      });

      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid data", 
          errors: validation.error.errors 
        });
      }

      const withdrawal = await storage.createWithdrawal(validation.data);
      res.json(withdrawal);
    } catch (error) {
      console.error("Error creating withdrawal:", error);
      res.status(500).json({ message: "Failed to create withdrawal request" });
    }
  });

  app.get('/api/withdrawals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const withdrawals = await storage.getUserWithdrawals(userId);
      res.json(withdrawals);
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      res.status(500).json({ message: "Failed to fetch withdrawals" });
    }
  });

  // Islamic reminders
  app.get('/api/islamic-reminders/daily', async (req, res) => {
    try {
      const reminder = await storage.getDailyIslamicReminder();
      res.json(reminder);
    } catch (error) {
      console.error("Error fetching Islamic reminder:", error);
      res.status(500).json({ message: "Failed to fetch Islamic reminder" });
    }
  });

  // System notices
  app.get('/api/notices', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const notices = await storage.getActiveNotices(user?.isPremium ? 'premium' : 'all');
      res.json(notices);
    } catch (error) {
      console.error("Error fetching notices:", error);
      res.status(500).json({ message: "Failed to fetch notices" });
    }
  });

  // Admin routes
  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.get('/api/admin/pending-files', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const files = await storage.getPendingFiles();
      res.json(files);
    } catch (error) {
      console.error("Error fetching pending files:", error);
      res.status(500).json({ message: "Failed to fetch pending files" });
    }
  });

  app.post('/api/admin/files/:fileId/approve', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { fileId } = req.params;
      const { approvedCount, adminNotes } = req.body;
      
      await storage.approveFile(fileId, approvedCount, adminNotes);
      res.json({ message: "File approved successfully" });
    } catch (error) {
      console.error("Error approving file:", error);
      res.status(500).json({ message: "Failed to approve file" });
    }
  });

  app.post('/api/admin/files/:fileId/reject', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { fileId } = req.params;
      const { adminNotes } = req.body;
      
      await storage.rejectFile(fileId, adminNotes);
      res.json({ message: "File rejected successfully" });
    } catch (error) {
      console.error("Error rejecting file:", error);
      res.status(500).json({ message: "Failed to reject file" });
    }
  });

  app.post('/api/admin/notices', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validation = insertNoticeSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid data", 
          errors: validation.error.errors 
        });
      }

      const notice = await storage.createNotice(validation.data);
      res.json(notice);
    } catch (error) {
      console.error("Error creating notice:", error);
      res.status(500).json({ message: "Failed to create notice" });
    }
  });

  app.post('/api/admin/daily-report', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { goodAccounts, reportDate } = req.body;
      await storage.createDailyReport(goodAccounts, reportDate);
      
      res.json({ message: "Daily report created successfully" });
    } catch (error) {
      console.error("Error creating daily report:", error);
      res.status(500).json({ message: "Failed to create daily report" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
