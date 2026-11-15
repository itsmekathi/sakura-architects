import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_inquiries_preferred_contact" AS ENUM('email', 'phone', 'either');
  CREATE TYPE "public"."enum_inquiries_submitted_as" AS ENUM('anonymous', 'account');
  CREATE TYPE "public"."enum_visitors_provider" AS ENUM('password', 'google');
  CREATE TABLE "visitors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"phone" varchar,
  	"provider" "enum_visitors_provider" DEFAULT 'password',
  	"google_sub" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  ALTER TABLE "inquiries" ALTER COLUMN "name" DROP NOT NULL;
  ALTER TABLE "inquiries" ADD COLUMN "preferred_contact" "enum_inquiries_preferred_contact" DEFAULT 'email';
  ALTER TABLE "inquiries" ADD COLUMN "submitted_as" "enum_inquiries_submitted_as";
  ALTER TABLE "inquiries" ADD COLUMN "visitor_id" integer;
  ALTER TABLE "inquiries" ADD COLUMN "consent_contact" boolean;
  ALTER TABLE "inquiries" ADD COLUMN "consent_data_notice" boolean;
  ALTER TABLE "inquiries" ADD COLUMN "consent_consented_at" timestamp(3) with time zone;
  ALTER TABLE "inquiries" ADD COLUMN "consent_text" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "visitors_id" integer;
  ALTER TABLE "payload_preferences_rels" ADD COLUMN "visitors_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "contact_consent_text" varchar DEFAULT 'I agree that representatives of Sakura Architects may contact me by phone or email about this enquiry.';
  ALTER TABLE "site_settings" ADD COLUMN "data_notice_text" varchar DEFAULT 'What we collect: the details you enter in this form (name, email, phone, project details and message) and, if you are signed in, a link to your account.
  
  Why: only to respond to your enquiry and discuss your project. We do not use it for marketing unless you ask us to, and we never sell or share it with third parties.
  
  Who can see it: Sakura Architects staff who handle enquiries. It is stored securely with our hosting providers.
  
  How long: we keep enquiries for {months} months after our last contact, then delete them, unless they become a project, in which case they are kept with the project records.
  
  Your rights: you can ask to see, correct or delete your information at any time by emailing the studio. If you have an account, you can delete it and your enquiries yourself from the My account page.';
  ALTER TABLE "site_settings" ADD COLUMN "retention_months" numeric DEFAULT 24;
  CREATE UNIQUE INDEX "visitors_google_sub_idx" ON "visitors" USING btree ("google_sub");
  CREATE INDEX "visitors_updated_at_idx" ON "visitors" USING btree ("updated_at");
  CREATE INDEX "visitors_created_at_idx" ON "visitors" USING btree ("created_at");
  CREATE UNIQUE INDEX "visitors_email_idx" ON "visitors" USING btree ("email");
  ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_visitor_id_visitors_id_fk" FOREIGN KEY ("visitor_id") REFERENCES "public"."visitors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_visitors_fk" FOREIGN KEY ("visitors_id") REFERENCES "public"."visitors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_visitors_fk" FOREIGN KEY ("visitors_id") REFERENCES "public"."visitors"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "inquiries_visitor_idx" ON "inquiries" USING btree ("visitor_id");
  CREATE INDEX "payload_locked_documents_rels_visitors_id_idx" ON "payload_locked_documents_rels" USING btree ("visitors_id");
  CREATE INDEX "payload_preferences_rels_visitors_id_idx" ON "payload_preferences_rels" USING btree ("visitors_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "visitors" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "visitors" CASCADE;
  ALTER TABLE "inquiries" DROP CONSTRAINT "inquiries_visitor_id_visitors_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_visitors_fk";
  
  ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT "payload_preferences_rels_visitors_fk";
  
  DROP INDEX "inquiries_visitor_idx";
  DROP INDEX "payload_locked_documents_rels_visitors_id_idx";
  DROP INDEX "payload_preferences_rels_visitors_id_idx";
  ALTER TABLE "inquiries" ALTER COLUMN "name" SET NOT NULL;
  ALTER TABLE "inquiries" DROP COLUMN "preferred_contact";
  ALTER TABLE "inquiries" DROP COLUMN "submitted_as";
  ALTER TABLE "inquiries" DROP COLUMN "visitor_id";
  ALTER TABLE "inquiries" DROP COLUMN "consent_contact";
  ALTER TABLE "inquiries" DROP COLUMN "consent_data_notice";
  ALTER TABLE "inquiries" DROP COLUMN "consent_consented_at";
  ALTER TABLE "inquiries" DROP COLUMN "consent_text";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "visitors_id";
  ALTER TABLE "payload_preferences_rels" DROP COLUMN "visitors_id";
  ALTER TABLE "site_settings" DROP COLUMN "contact_consent_text";
  ALTER TABLE "site_settings" DROP COLUMN "data_notice_text";
  ALTER TABLE "site_settings" DROP COLUMN "retention_months";
  DROP TYPE "public"."enum_inquiries_preferred_contact";
  DROP TYPE "public"."enum_inquiries_submitted_as";
  DROP TYPE "public"."enum_visitors_provider";`)
}
