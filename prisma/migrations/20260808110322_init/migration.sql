-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PARENT', 'CHILD', 'TEACHER', 'ADMIN');

-- CreateEnum
CREATE TYPE "FamilyRole" AS ENUM ('OWNER', 'GUARDIAN', 'CHILD');

-- CreateEnum
CREATE TYPE "CurrencyType" AS ENUM ('STARS', 'HEARTS', 'ENERGY', 'XP');

-- CreateEnum
CREATE TYPE "LedgerSource" AS ENUM ('DAILY_LOGIN', 'LESSON_COMPLETED', 'STREAK_MILESTONE', 'TREASURE_CHEST', 'ACHIEVEMENT', 'AVATAR_PURCHASE', 'HEART_REFILL', 'ENERGY_REFILL', 'ADMIN_ADJUSTMENT');

-- CreateEnum
CREATE TYPE "InventoryItemType" AS ENUM ('AVATAR_COSMETIC', 'LETTER_COLLECTIBLE', 'BADGE', 'WORLD', 'TREASURE_CHEST');

-- CreateEnum
CREATE TYPE "LessonStatus" AS ENUM ('STARTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ConsentType" AS ENUM ('CHILD_ACCOUNT', 'DATA_PROCESSING', 'REWARDED_VIDEO', 'PARENT_REFILL');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "role" "UserRole" NOT NULL,
    "display_name" TEXT NOT NULL,
    "date_of_birth" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "family_id" UUID,
    "display_name" TEXT NOT NULL,
    "birth_year" INTEGER,
    "avatar_key" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "families" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "families_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "family_members" (
    "id" UUID NOT NULL,
    "family_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "FamilyRole" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "family_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guardian_consents" (
    "id" UUID NOT NULL,
    "guardian_id" UUID NOT NULL,
    "child_profile_id" UUID NOT NULL,
    "type" "ConsentType" NOT NULL,
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "guardian_consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "profile_id" UUID NOT NULL,
    "stars_balance" INTEGER NOT NULL DEFAULT 0,
    "hearts_balance" INTEGER NOT NULL DEFAULT 5,
    "energy_balance" INTEGER NOT NULL DEFAULT 10,
    "xp_total" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("profile_id")
);

-- CreateTable
CREATE TABLE "wallet_ledger" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "currency" "CurrencyType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "source" "LedgerSource" NOT NULL,
    "source_id" TEXT,
    "idempotency_key" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_attempts" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "status" "LessonStatus" NOT NULL DEFAULT 'STARTED',
    "correct_answers" INTEGER NOT NULL DEFAULT 0,
    "first_attempt_correct" INTEGER NOT NULL DEFAULT 0,
    "total_questions" INTEGER NOT NULL DEFAULT 0,
    "mistakes" INTEGER NOT NULL DEFAULT 0,
    "hints_used" INTEGER NOT NULL DEFAULT 0,
    "time_spent_seconds" INTEGER NOT NULL DEFAULT 0,
    "rating" INTEGER,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lesson_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_progress" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "best_rating" INTEGER NOT NULL DEFAULT 0,
    "completions" INTEGER NOT NULL DEFAULT 0,
    "last_completed_at" TIMESTAMP(3),

    CONSTRAINT "lesson_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "letter_progress" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "letter_key" TEXT NOT NULL,
    "mastered_at" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "correct" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "letter_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "streaks" (
    "profile_id" UUID NOT NULL,
    "current_days" INTEGER NOT NULL DEFAULT 0,
    "longest_days" INTEGER NOT NULL DEFAULT 0,
    "last_activity_date" DATE,
    "freezes_available" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "streaks_pkey" PRIMARY KEY ("profile_id")
);

-- CreateTable
CREATE TABLE "daily_reward_claims" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "claim_date" DATE NOT NULL,
    "day_index" INTEGER NOT NULL,
    "reward" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_reward_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treasure_chests" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "trigger_lesson_count" INTEGER NOT NULL,
    "opened_at" TIMESTAMP(3),
    "reward" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "treasure_chests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reward" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_achievements" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "achievement_id" TEXT NOT NULL,
    "awarded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog_items" (
    "id" TEXT NOT NULL,
    "type" "InventoryItemType" NOT NULL,
    "name" TEXT NOT NULL,
    "cost_stars" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "catalog_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "catalog_item_id" TEXT,
    "type" "InventoryItemType" NOT NULL,
    "key" TEXT NOT NULL,
    "metadata" JSONB,
    "acquired_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_events" (
    "id" UUID NOT NULL,
    "actor_user_id" UUID,
    "profile_id" UUID,
    "action" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "profiles_family_id_idx" ON "profiles"("family_id");

-- CreateIndex
CREATE UNIQUE INDEX "family_members_family_id_user_id_key" ON "family_members"("family_id", "user_id");

-- CreateIndex
CREATE INDEX "guardian_consents_child_profile_id_idx" ON "guardian_consents"("child_profile_id");

-- CreateIndex
CREATE INDEX "wallet_ledger_profile_id_source_idx" ON "wallet_ledger"("profile_id", "source");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_ledger_profile_id_currency_idempotency_key_key" ON "wallet_ledger"("profile_id", "currency", "idempotency_key");

-- CreateIndex
CREATE INDEX "lesson_attempts_profile_id_lesson_id_idx" ON "lesson_attempts"("profile_id", "lesson_id");

-- CreateIndex
CREATE UNIQUE INDEX "lesson_progress_profile_id_lesson_id_key" ON "lesson_progress"("profile_id", "lesson_id");

-- CreateIndex
CREATE UNIQUE INDEX "letter_progress_profile_id_letter_key_key" ON "letter_progress"("profile_id", "letter_key");

-- CreateIndex
CREATE UNIQUE INDEX "daily_reward_claims_profile_id_claim_date_key" ON "daily_reward_claims"("profile_id", "claim_date");

-- CreateIndex
CREATE UNIQUE INDEX "treasure_chests_profile_id_trigger_lesson_count_key" ON "treasure_chests"("profile_id", "trigger_lesson_count");

-- CreateIndex
CREATE UNIQUE INDEX "profile_achievements_profile_id_achievement_id_key" ON "profile_achievements"("profile_id", "achievement_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_profile_id_key_key" ON "inventory_items"("profile_id", "key");

-- CreateIndex
CREATE INDEX "audit_events_actor_user_id_idx" ON "audit_events"("actor_user_id");

-- CreateIndex
CREATE INDEX "audit_events_profile_id_idx" ON "audit_events"("profile_id");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guardian_consents" ADD CONSTRAINT "guardian_consents_guardian_id_fkey" FOREIGN KEY ("guardian_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_ledger" ADD CONSTRAINT "wallet_ledger_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "wallets"("profile_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_attempts" ADD CONSTRAINT "lesson_attempts_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "letter_progress" ADD CONSTRAINT "letter_progress_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "streaks" ADD CONSTRAINT "streaks_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_reward_claims" ADD CONSTRAINT "daily_reward_claims_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treasure_chests" ADD CONSTRAINT "treasure_chests_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_achievements" ADD CONSTRAINT "profile_achievements_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_achievements" ADD CONSTRAINT "profile_achievements_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "achievements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_catalog_item_id_fkey" FOREIGN KEY ("catalog_item_id") REFERENCES "catalog_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
