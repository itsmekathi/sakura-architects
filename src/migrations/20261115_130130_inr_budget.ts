import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_inquiries_budget_range" AS ENUM('unsure', 'lt25l', '25l-1cr', '1cr-5cr', 'gt5cr', 'custom');
  ALTER TABLE "inquiries" ALTER COLUMN "budget" SET DATA TYPE varchar;
  ALTER TABLE "inquiries" ADD COLUMN "budget_range" "enum_inquiries_budget_range";
  ALTER TABLE "inquiries" ADD COLUMN "budget_min" numeric;
  ALTER TABLE "inquiries" ADD COLUMN "budget_max" numeric;
  DROP TYPE "public"."enum_inquiries_budget";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_inquiries_budget" AS ENUM('unsure', 'lt50k', '50k-250k', '250k-1m', 'gt1m');
  ALTER TABLE "inquiries" ALTER COLUMN "budget" SET DATA TYPE "public"."enum_inquiries_budget" USING "budget"::"public"."enum_inquiries_budget";
  ALTER TABLE "inquiries" DROP COLUMN "budget_range";
  ALTER TABLE "inquiries" DROP COLUMN "budget_min";
  ALTER TABLE "inquiries" DROP COLUMN "budget_max";
  DROP TYPE "public"."enum_inquiries_budget_range";`)
}
