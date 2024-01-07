/*
  Warnings:

  - A unique constraint covering the columns `[song_id]` on the table `Track` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `artist_name` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "artist_name" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Track" ADD COLUMN     "song_id" TEXT;

-- CreateTable
CREATE TABLE "Song" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "post_id" TEXT,

    CONSTRAINT "Song_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Song_title_key" ON "Song"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Track_song_id_key" ON "Track"("song_id");

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "Song"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Song" ADD CONSTRAINT "Song_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
