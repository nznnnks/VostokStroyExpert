-- AlterTable
ALTER TABLE "User"
ADD COLUMN     "loginCodeHash" TEXT,
ADD COLUMN     "loginCodeExpiresAt" TIMESTAMP(3),
ADD COLUMN     "loginCodeSentAt" TIMESTAMP(3);

