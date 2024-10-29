/*
  Warnings:

  - Added the required column `number` to the `PullRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PullRequest" ADD COLUMN     "number" INTEGER NOT NULL;
