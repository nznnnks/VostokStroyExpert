-- Make deleting a user cascade-delete their orders.
-- This is requested behavior (order history is removed with the user).

ALTER TABLE "Order" DROP CONSTRAINT IF EXISTS "Order_userId_fkey";

ALTER TABLE "Order"
ADD CONSTRAINT "Order_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

