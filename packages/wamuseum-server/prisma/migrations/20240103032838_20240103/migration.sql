-- DropForeignKey
ALTER TABLE "AlbumCover" DROP CONSTRAINT "AlbumCover_post_id_fkey";

-- DropForeignKey
ALTER TABLE "Song" DROP CONSTRAINT "Song_post_id_fkey";

-- DropForeignKey
ALTER TABLE "Track" DROP CONSTRAINT "Track_post_id_fkey";

-- DropForeignKey
ALTER TABLE "Track" DROP CONSTRAINT "Track_song_id_fkey";

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlbumCover" ADD CONSTRAINT "AlbumCover_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Song" ADD CONSTRAINT "Song_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
