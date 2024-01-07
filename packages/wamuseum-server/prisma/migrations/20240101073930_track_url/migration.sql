/*
  Warnings:

  - A unique constraint covering the columns `[url]` on the table `Track` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `url` to the `Track` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Track" ADD COLUMN     "url" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Track_url_key" ON "Track"("url");
