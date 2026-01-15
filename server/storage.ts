import {
  users,
  files,
  categoryRates,
  accountReports,
  referrals,
  commissions,
  withdrawals,
  quizzes,
  quizAttempts,
  islamicReminders,
  notices,
  systemSettings,
  type User,
  type UpsertUser,
  type InsertUser,
  type File,
  type InsertFile,
  type CategoryRate,
  type InsertCategoryRate,
  type AccountReport,
  type Referral,
  type Commission,
  type Withdrawal,
  type InsertWithdrawal,
  type Quiz,
  type InsertQuiz,
  type QuizAttempt,
  type IslamicReminder,
  type InsertIslamicReminder,
  type Notice,
  type InsertNotice,
  type SystemSetting,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, gte, lte, like, or, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Dashboard operations
  getDashboardStats(userId: string): Promise<any>;
  
  // Category operations
  getCategoryRates(): Promise<CategoryRate[]>;
  updateCategoryRate(category: string, rate: number, isActive: boolean): Promise<void>;
  
  // File operations
  submitFile(fileData: InsertFile): Promise<File>;
  getUserFiles(userId: string): Promise<File[]>;
  getPendingFiles(): Promise<any[]>;
  approveFile(fileId: string, approvedCount?: number, adminNotes?: string): Promise<void>;
  rejectFile(fileId: string, adminNotes?: string): Promise<void>;
  
  // Account verification operations
  verifyAccounts(uids: string[], reportDate?: string): Promise<any>;
  createDailyReport(goodAccounts: any[], reportDate?: string): Promise<void>;
  
  // Referral operations
  getReferralData(userId: string): Promise<any>;
  createReferral(referrerId: string, referredId: string, level: number): Promise<void>;
  calculateCommission(userId: string, amount: number): Promise<void>;
  
  // Quiz operations
  getDailyQuiz(): Promise<Quiz | null>;
  submitQuizAttempt(userId: string, quizId: string, answers: any[]): Promise<any>;
  getQuizLeaderboard(): Promise<any[]>;
  
  // Withdrawal operations
  createWithdrawal(withdrawalData: InsertWithdrawal): Promise<Withdrawal>;
  getUserWithdrawals(userId: string): Promise<Withdrawal[]>;
  
  // Islamic reminders
  getDailyIslamicReminder(): Promise<IslamicReminder | null>;
  
  // Notices
  getActiveNotices(targetAudience: string): Promise<Notice[]>;
  createNotice(noticeData: InsertNotice): Promise<Notice>;
  
  // Admin operations
  getAdminStats(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        referralCode: userData.referralCode || `GENZ-${userData.id?.slice(-8) || Math.random().toString(36).slice(-8)}`,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Dashboard operations
  async getDashboardStats(userId: string): Promise<any> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const userFiles = await db
      .select()
      .from(files)
      .where(eq(files.userId, userId));

    const totalSubmissions = userFiles.length;
    const approvedFiles = userFiles.filter(f => f.status === 'approved').length;

    return {
      balance: user.balance || '0.00',
      totalEarned: user.totalEarned || '0.00',
      totalWithdrawn: user.totalWithdrawn || '0.00',
      totalSubmissions,
      approvedFiles,
    };
  }

  // Category operations
  async getCategoryRates(): Promise<CategoryRate[]> {
    return await db.select().from(categoryRates).where(eq(categoryRates.isActive, true));
  }

  async updateCategoryRate(category: string, rate: number, isActive: boolean): Promise<void> {
    await db
      .insert(categoryRates)
      .values({ category, rate: rate.toString(), isActive })
      .onConflictDoUpdate({
        target: categoryRates.category,
        set: { rate: rate.toString(), isActive, updatedAt: new Date() },
      });
  }

  // File operations
  async submitFile(fileData: InsertFile): Promise<File> {
    const fileCounter = `GENZ-${Date.now()}-${Math.random().toString(36).slice(-6)}`;
    
    const [file] = await db
      .insert(files)
      .values({
        ...fileData,
        fileCounter,
        status: 'pending',
      })
      .returning();
    
    return file;
  }

  async getUserFiles(userId: string): Promise<File[]> {
    return await db
      .select()
      .from(files)
      .where(eq(files.userId, userId))
      .orderBy(desc(files.uploadDate));
  }

  async getPendingFiles(): Promise<any[]> {
    const pendingFiles = await db
      .select({
        id: files.id,
        userId: files.userId,
        filename: files.filename,
        category: files.category,
        accountCount: files.accountCount,
        fileContent: files.fileContent,
        uploadDate: files.uploadDate,
        fileCounter: files.fileCounter,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(files)
      .leftJoin(users, eq(files.userId, users.id))
      .where(eq(files.status, 'pending'))
      .orderBy(desc(files.uploadDate));

    return pendingFiles;
  }

  async approveFile(fileId: string, approvedCount?: number, adminNotes?: string): Promise<void> {
    const file = await db.select().from(files).where(eq(files.id, fileId)).limit(1);
    if (!file[0]) throw new Error("File not found");

    const finalApprovedCount = approvedCount || file[0].accountCount;
    
    // Get rate for category
    const categoryRate = await db
      .select()
      .from(categoryRates)
      .where(eq(categoryRates.category, file[0].category))
      .limit(1);
    
    const rate = categoryRate[0]?.rate ? parseFloat(categoryRate[0].rate) : 2.0;
    const totalEarning = finalApprovedCount * rate;

    // Update file
    await db
      .update(files)
      .set({
        status: 'approved',
        approvedCount: finalApprovedCount,
        ratePerAccount: rate.toString(),
        totalEarning: totalEarning.toString(),
        adminNotes,
        approvedDate: new Date(),
      })
      .where(eq(files.id, fileId));

    // Update user balance and earnings
    await db
      .update(users)
      .set({
        balance: sql`${users.balance} + ${totalEarning}`,
        totalEarned: sql`${users.totalEarned} + ${totalEarning}`,
      })
      .where(eq(users.id, file[0].userId));

    // Calculate MLM commission
    await this.calculateCommission(file[0].userId, totalEarning);
  }

  async rejectFile(fileId: string, adminNotes?: string): Promise<void> {
    await db
      .update(files)
      .set({
        status: 'rejected',
        adminNotes,
        approvedDate: new Date(),
      })
      .where(eq(files.id, fileId));
  }

  // Account verification operations
  async verifyAccounts(uids: string[], reportDate?: string): Promise<any> {
    const targetDate = reportDate ? new Date(reportDate) : new Date();
    
    const reports = await db
      .select()
      .from(accountReports)
      .where(
        and(
          inArray(accountReports.uid, uids),
          eq(accountReports.reportDate, targetDate),
          eq(accountReports.isActive, true)
        )
      );

    const results: any = {};
    uids.forEach(uid => {
      const report = reports.find(r => r.uid === uid);
      results[uid] = {
        status: report?.status || 'not_found',
        found: !!report,
        category: report?.category,
        notes: report?.adminNotes,
        reportDate: targetDate.toISOString().split('T')[0],
      };
    });

    return results;
  }

  async createDailyReport(goodAccounts: any[], reportDate?: string): Promise<void> {
    const targetDate = reportDate ? new Date(reportDate) : new Date();
    
    // Clear existing reports for the date
    await db
      .delete(accountReports)
      .where(eq(accountReports.reportDate, targetDate));

    // Insert good accounts
    if (goodAccounts.length > 0) {
      await db.insert(accountReports).values(
        goodAccounts.map(account => ({
          uid: account.uid,
          category: account.category || 'unknown',
          status: 'good',
          reportDate: targetDate,
          adminNotes: account.notes || '',
          isActive: true,
        }))
      );
    }
  }

  // Referral operations
  async getReferralData(userId: string): Promise<any> {
    const directReferrals = await db
      .select()
      .from(referrals)
      .where(and(eq(referrals.referrerId, userId), eq(referrals.level, 1)));

    const totalCommissions = await db
      .select()
      .from(commissions)
      .where(eq(commissions.userId, userId));

    const commissionSum = totalCommissions.reduce((sum, commission) => 
      sum + parseFloat(commission.amount.toString()), 0);

    // Get level statistics
    const levelStats = await db
      .select({
        level: referrals.level,
        count: sql<number>`count(*)`,
        totalCommission: sql<number>`sum(${referrals.totalCommission})`,
      })
      .from(referrals)
      .where(eq(referrals.referrerId, userId))
      .groupBy(referrals.level);

    return {
      totalReferrals: directReferrals.length,
      totalCommission: commissionSum.toFixed(2),
      levelStats: levelStats.reduce((acc, stat) => {
        acc[`level${stat.level}`] = {
          count: stat.count,
          earnings: stat.totalCommission?.toFixed(2) || '0.00',
        };
        return acc;
      }, {} as any),
      recentReferrals: [], // Would need additional query for recent referrals
    };
  }

  async createReferral(referrerId: string, referredId: string, level: number): Promise<void> {
    const commissionRates = [0.05, 0.03, 0.02, 0.015, 0.01]; // 5%, 3%, 2%, 1.5%, 1%
    const rate = commissionRates[level - 1] || 0;

    await db.insert(referrals).values({
      referrerId,
      referredId,
      level,
      commissionRate: rate.toString(),
      isActive: true,
    });
  }

  async calculateCommission(userId: string, amount: number): Promise<void> {
    const user = await this.getUser(userId);
    if (!user?.referredBy) return;

    // Find the referrer and calculate commissions up to 5 levels
    let currentReferralCode = user.referredBy;
    let level = 1;
    const commissionRates = [0.05, 0.03, 0.02, 0.015, 0.01];

    while (currentReferralCode && level <= 5) {
      const referrer = await db
        .select()
        .from(users)
        .where(eq(users.referralCode, currentReferralCode))
        .limit(1);

      if (!referrer[0]) break;

      const commissionAmount = amount * commissionRates[level - 1];

      // Add commission to referrer
      await db
        .update(users)
        .set({
          balance: sql`${users.balance} + ${commissionAmount}`,
          totalEarned: sql`${users.totalEarned} + ${commissionAmount}`,
        })
        .where(eq(users.id, referrer[0].id));

      // Record commission transaction
      await db.insert(commissions).values({
        userId: referrer[0].id,
        fromUserId: userId,
        amount: commissionAmount.toString(),
        level,
        transactionType: 'commission',
        description: `Level ${level} commission from ${user.username || user.firstName}`,
      });

      // Update referral total commission
      await db
        .update(referrals)
        .set({
          totalCommission: sql`${referrals.totalCommission} + ${commissionAmount}`,
        })
        .where(
          and(
            eq(referrals.referrerId, referrer[0].id),
            eq(referrals.referredId, userId)
          )
        );

      currentReferralCode = referrer[0].referredBy || '';
      level++;
    }
  }

  // Quiz operations
  async getDailyQuiz(): Promise<Quiz | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [quiz] = await db
      .select()
      .from(quizzes)
      .where(
        and(
          eq(quizzes.isActive, true),
          gte(quizzes.endDate, today),
          lte(quizzes.startDate, tomorrow)
        )
      )
      .limit(1);

    return quiz || null;
  }

  async submitQuizAttempt(userId: string, quizId: string, answers: any[]): Promise<any> {
    const quiz = await db.select().from(quizzes).where(eq(quizzes.id, quizId)).limit(1);
    if (!quiz[0]) throw new Error("Quiz not found");

    // Calculate score (simplified - in real implementation, check against correct answers)
    const score = answers.length; // Placeholder scoring
    const rewardEarned = parseFloat(quiz[0].rewardAmount?.toString() || '0');

    const [attempt] = await db.insert(quizAttempts).values({
      userId,
      quizId,
      answers: JSON.stringify(answers),
      score,
      totalQuestions: quiz[0].totalQuestions,
      rewardEarned: rewardEarned.toString(),
    }).returning();

    // Add reward to user balance
    if (rewardEarned > 0) {
      await db
        .update(users)
        .set({
          balance: sql`${users.balance} + ${rewardEarned}`,
          totalEarned: sql`${users.totalEarned} + ${rewardEarned}`,
        })
        .where(eq(users.id, userId));
    }

    return {
      score,
      totalQuestions: quiz[0].totalQuestions,
      rewardEarned,
      percentage: (score / quiz[0].totalQuestions) * 100,
    };
  }

  async getQuizLeaderboard(): Promise<any[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const leaderboard = await db
      .select({
        userId: quizAttempts.userId,
        username: users.username,
        firstName: users.firstName,
        score: quizAttempts.score,
        totalQuestions: quizAttempts.totalQuestions,
        percentage: sql<number>`(${quizAttempts.score} * 100.0 / ${quizAttempts.totalQuestions})`,
      })
      .from(quizAttempts)
      .leftJoin(users, eq(quizAttempts.userId, users.id))
      .where(gte(quizAttempts.completedAt, today))
      .orderBy(sql`(${quizAttempts.score} * 100.0 / ${quizAttempts.totalQuestions}) DESC`)
      .limit(10);

    return leaderboard.map((entry, index) => ({
      rank: index + 1,
      username: entry.username || entry.firstName || 'Anonymous',
      percentage: Math.round(entry.percentage || 0),
    }));
  }

  // Withdrawal operations
  async createWithdrawal(withdrawalData: InsertWithdrawal): Promise<Withdrawal> {
    const user = await this.getUser(withdrawalData.userId);
    if (!user) throw new Error("User not found");

    const amount = parseFloat(withdrawalData.amount.toString());
    if (amount > parseFloat(user.balance?.toString() || '0')) {
      throw new Error("Insufficient balance");
    }

    const [withdrawal] = await db.insert(withdrawals).values(withdrawalData).returning();

    // Deduct amount from user balance
    await db
      .update(users)
      .set({
        balance: sql`${users.balance} - ${amount}`,
      })
      .where(eq(users.id, withdrawalData.userId));

    return withdrawal;
  }

  async getUserWithdrawals(userId: string): Promise<Withdrawal[]> {
    return await db
      .select()
      .from(withdrawals)
      .where(eq(withdrawals.userId, userId))
      .orderBy(desc(withdrawals.requestedAt));
  }

  // Islamic reminders
  async getDailyIslamicReminder(): Promise<IslamicReminder | null> {
    const today = new Date();
    
    const [reminder] = await db
      .select()
      .from(islamicReminders)
      .where(
        and(
          eq(islamicReminders.isActive, true),
          or(
            sql`DATE(${islamicReminders.displayDate}) = DATE(${today.toISOString()})`,
            sql`${islamicReminders.displayDate} IS NULL`
          )
        )
      )
      .orderBy(desc(islamicReminders.createdAt))
      .limit(1);

    return reminder || null;
  }

  // Notices
  async getActiveNotices(targetAudience: string): Promise<Notice[]> {
    const now = new Date();
    
    return await db
      .select()
      .from(notices)
      .where(
        and(
          eq(notices.isActive, true),
          or(
            eq(notices.targetAudience, 'all'),
            eq(notices.targetAudience, targetAudience)
          ),
          or(
            sql`${notices.expiresAt} IS NULL`,
            gte(notices.expiresAt, now)
          )
        )
      )
      .orderBy(desc(notices.priority), desc(notices.createdAt));
  }

  async createNotice(noticeData: InsertNotice): Promise<Notice> {
    const [notice] = await db.insert(notices).values(noticeData).returning();
    return notice;
  }

  // Admin operations
  async getAdminStats(): Promise<any> {
    const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
    const activeUsers = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.isActive, true));
    const pendingFiles = await db.select({ count: sql<number>`count(*)` }).from(files).where(eq(files.status, 'pending'));
    
    const totalEarnings = await db
      .select({ sum: sql<number>`sum(${users.totalEarned})` })
      .from(users);

    const activeCategories = await db
      .select({ count: sql<number>`count(*)` })
      .from(categoryRates)
      .where(eq(categoryRates.isActive, true));

    return {
      totalUsers: totalUsers[0]?.count || 0,
      activeUsers: activeUsers[0]?.count || 0,
      pendingFiles: pendingFiles[0]?.count || 0,
      totalEarnings: totalEarnings[0]?.sum?.toFixed(2) || '0.00',
      activeCategories: activeCategories[0]?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
