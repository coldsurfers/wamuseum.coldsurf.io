/*
  Warnings:

  - A unique constraint covering the columns `[post_id]` on the table `AlbumCover` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `post_id` to the `AlbumCover` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AlbumCover" ADD COLUMN     "post_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Track" ADD COLUMN     "post_id" TEXT;

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AlbumCover_post_id_key" ON "AlbumCover"("post_id");

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlbumCover" ADD CONSTRAINT "AlbumCover_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
