-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "login" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_confirmations" (
    "confirmationCode" TEXT,
    "expirationDate" TIMESTAMPTZ,
    "isConfirmed" BOOLEAN NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "user_confirmations_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "public"."password_recoveries" (
    "recoveryCodeHash" TEXT NOT NULL,
    "expirationDate" TIMESTAMPTZ NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "password_recoveries_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "public"."user_confirmations" ADD CONSTRAINT "user_confirmations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."password_recoveries" ADD CONSTRAINT "password_recoveries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
