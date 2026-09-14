-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "bayId" INTEGER;

-- CreateTable
CREATE TABLE "Bay" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bay_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_bayId_fkey" FOREIGN KEY ("bayId") REFERENCES "Bay"("id") ON DELETE SET NULL ON UPDATE CASCADE;
