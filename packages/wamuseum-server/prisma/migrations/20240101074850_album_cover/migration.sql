-- CreateTable
CREATE TABLE "AlbumCover" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlbumCover_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AlbumCover_filename_key" ON "AlbumCover"("filename");

-- CreateIndex
CREATE UNIQUE INDEX "AlbumCover_url_key" ON "AlbumCover"("url");
