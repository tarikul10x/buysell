CREATE TABLE "account_reports" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"uid" varchar NOT NULL,
	"category" varchar NOT NULL,
	"status" varchar NOT NULL,
	"submitter_id" varchar,
	"file_id" varchar,
	"admin_notes" text,
	"report_date" timestamp NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "category_rates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" varchar NOT NULL,
	"subcategory" varchar,
	"rate" numeric(10, 2) NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "category_rates_category_unique" UNIQUE("category")
);
--> statement-breakpoint
CREATE TABLE "commissions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"from_user_id" varchar NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"level" integer NOT NULL,
	"transaction_type" varchar DEFAULT 'commission',
	"description" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"filename" varchar NOT NULL,
	"category" varchar NOT NULL,
	"subcategory" varchar,
	"account_count" integer NOT NULL,
	"approved_count" integer DEFAULT 0,
	"status" varchar DEFAULT 'pending',
	"submission_method" varchar DEFAULT 'web',
	"file_content" text,
	"rate_per_account" numeric(10, 2),
	"total_earning" numeric(10, 2) DEFAULT '0.00',
	"sheet_url" text,
	"uploaded_to_sheet" boolean DEFAULT false,
	"admin_notes" text,
	"file_counter" varchar,
	"upload_date" timestamp DEFAULT now(),
	"approved_date" timestamp,
	CONSTRAINT "files_file_counter_unique" UNIQUE("file_counter")
);
--> statement-breakpoint
CREATE TABLE "islamic_reminders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar NOT NULL,
	"content" text NOT NULL,
	"source" varchar,
	"is_active" boolean DEFAULT true,
	"display_date" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notices" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar NOT NULL,
	"content" text NOT NULL,
	"type" varchar DEFAULT 'info',
	"target_audience" varchar DEFAULT 'all',
	"priority" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quiz_attempts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"quiz_id" varchar NOT NULL,
	"answers" jsonb NOT NULL,
	"score" integer NOT NULL,
	"total_questions" integer NOT NULL,
	"completed_at" timestamp DEFAULT now(),
	"reward_earned" numeric(10, 2) DEFAULT '0.00'
);
--> statement-breakpoint
CREATE TABLE "quizzes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"questions" jsonb NOT NULL,
	"total_questions" integer NOT NULL,
	"time_limit" integer,
	"reward_amount" numeric(10, 2) DEFAULT '0.00',
	"is_active" boolean DEFAULT true,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referrer_id" varchar NOT NULL,
	"referred_id" varchar NOT NULL,
	"level" integer NOT NULL,
	"commission_rate" numeric(5, 2) NOT NULL,
	"total_commission" numeric(10, 2) DEFAULT '0.00',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar NOT NULL,
	"value" text NOT NULL,
	"data_type" varchar DEFAULT 'string',
	"description" text,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "system_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"username" varchar,
	"telegram_id" varchar,
	"phone" varchar,
	"payment_method" varchar,
	"payment_number" varchar,
	"binance_email" varchar,
	"balance" numeric(10, 2) DEFAULT '0.00',
	"total_earned" numeric(10, 2) DEFAULT '0.00',
	"total_withdrawn" numeric(10, 2) DEFAULT '0.00',
	"referral_code" varchar,
	"referred_by" varchar,
	"is_active" boolean DEFAULT true,
	"is_banned" boolean DEFAULT false,
	"is_premium" boolean DEFAULT false,
	"is_admin" boolean DEFAULT false,
	"password" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_telegram_id_unique" UNIQUE("telegram_id"),
	CONSTRAINT "users_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE "withdrawals" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"payment_method" varchar NOT NULL,
	"payment_details" jsonb,
	"status" varchar DEFAULT 'pending',
	"transaction_id" varchar,
	"admin_notes" text,
	"requested_at" timestamp DEFAULT now(),
	"processed_at" timestamp
);
--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");