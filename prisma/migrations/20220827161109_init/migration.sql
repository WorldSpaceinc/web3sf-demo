-- CreateTable
CREATE TABLE "Review" (
    "id" SERIAL NOT NULL,
    "user" TEXT NOT NULL DEFAULT '',
    "review" TEXT NOT NULL DEFAULT '',
    "image" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);
