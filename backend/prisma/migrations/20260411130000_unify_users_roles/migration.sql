ALTER TYPE "UserRole" RENAME TO "UserRole_old";

CREATE TYPE "UserRole" AS ENUM ('CLIENT', 'MANAGER', 'EDITOR', 'SUPERADMIN');

ALTER TABLE "User"
ALTER COLUMN "role" DROP DEFAULT,
ALTER COLUMN "role" TYPE "UserRole" USING ("role"::text::"UserRole"),
ALTER COLUMN "role" SET DEFAULT 'CLIENT';

ALTER TABLE "User"
ADD COLUMN "firstName" TEXT,
ADD COLUMN "lastName" TEXT;

UPDATE "User" AS u
SET
  "firstName" = COALESCE(u."firstName", cp."firstName"),
  "lastName" = COALESCE(u."lastName", cp."lastName")
FROM "ClientProfile" AS cp
WHERE cp."userId" = u."id";

INSERT INTO "User" (
  "id",
  "email",
  "phone",
  "passwordHash",
  "firstName",
  "lastName",
  "role",
  "status",
  "lastLoginAt",
  "createdAt",
  "updatedAt"
)
SELECT
  a."id",
  a."email",
  NULL,
  a."passwordHash",
  a."firstName",
  a."lastName",
  a."role"::text::"UserRole",
  CASE
    WHEN a."isActive" THEN 'ACTIVE'::"UserStatus"
    ELSE 'BLOCKED'::"UserStatus"
  END,
  NULL,
  a."createdAt",
  a."updatedAt"
FROM "AdminUser" AS a;

ALTER TABLE "News" DROP CONSTRAINT "News_authorId_fkey";

ALTER TABLE "News"
ADD CONSTRAINT "News_authorId_fkey"
FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

DROP TABLE "AdminUser";

DROP TYPE "UserRole_old";
