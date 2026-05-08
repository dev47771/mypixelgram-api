-- CreateTable
CREATE TABLE "public"."block_info" (
    "userId" TEXT NOT NULL,
    "reasonId" INTEGER,
    "reasonDetail" TEXT,

    CONSTRAINT "block_info_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "public"."block_reason" (
    "id" SERIAL NOT NULL,
    "reason" TEXT NOT NULL,

    CONSTRAINT "block_reason_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "block_reason_reason_key" ON "public"."block_reason"("reason");

-- AddForeignKey
ALTER TABLE "public"."block_info" ADD CONSTRAINT "block_info_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."block_info" ADD CONSTRAINT "block_info_reasonId_fkey" FOREIGN KEY ("reasonId") REFERENCES "public"."block_reason"("id") ON DELETE SET NULL ON UPDATE CASCADE;
