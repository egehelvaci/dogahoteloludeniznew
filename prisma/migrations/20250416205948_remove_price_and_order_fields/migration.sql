/*
  Warnings:

  - You are about to drop the column `order_number` on the `room_gallery` table. All the data in the column will be lost.
  - You are about to drop the column `order_number` on the `rooms` table. All the data in the column will be lost.
  - You are about to drop the column `price_en` on the `rooms` table. All the data in the column will be lost.
  - You are about to drop the column `price_tr` on the `rooms` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "room_gallery" DROP COLUMN "order_number";

-- AlterTable
ALTER TABLE "rooms" DROP COLUMN "order_number",
DROP COLUMN "price_en",
DROP COLUMN "price_tr";
