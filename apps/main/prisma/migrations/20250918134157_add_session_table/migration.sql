-- CreateTable
CREATE TABLE "public"."session_user" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "iat" TEXT NOT NULL,
    "exp" TEXT NOT NULL,
    "deviceName" TEXT NOT NULL,
    "ip" TEXT NOT NULL,

    CONSTRAINT "session_user_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."session_user" ADD CONSTRAINT "session_user_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
