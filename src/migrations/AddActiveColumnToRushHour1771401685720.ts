import { MigrationInterface, QueryRunner } from "typeorm";

export class AddActiveColumnToRushHour1771401685720 implements MigrationInterface {
    name = 'AddActiveColumnToRushHour1771401685720'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tickets" DROP CONSTRAINT "tickets_zone_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "tickets" DROP CONSTRAINT "tickets_gate_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "zones" DROP CONSTRAINT "zones_category_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_category_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_user_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "gate_zones" DROP CONSTRAINT "gate_zones_gate_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "gate_zones" DROP CONSTRAINT "gate_zones_zone_id_fkey"`);
        await queryRunner.query(`DROP INDEX "public"."idx_tickets_zone"`);
        await queryRunner.query(`DROP INDEX "public"."idx_tickets_gate"`);
        await queryRunner.query(`DROP INDEX "public"."idx_tickets_checkout"`);
        await queryRunner.query(`DROP INDEX "public"."idx_zones_category"`);
        await queryRunner.query(`DROP INDEX "public"."idx_subscriptions_category"`);
        await queryRunner.query(`ALTER TABLE "rush_hours" ADD "active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "vacations" ADD "active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "zones" ALTER COLUMN "occupied" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "zones" ALTER COLUMN "open" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "active" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "createdAt" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ALTER COLUMN "active" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ALTER COLUMN "currentCheckins" SET NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_113b162a9d9d2ea94ebf16f7fa" ON "gate_zones" ("gate_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_ce0c6a4f89e9eddafde8a36e01" ON "gate_zones" ("zone_id") `);
        await queryRunner.query(`ALTER TABLE "tickets" ADD CONSTRAINT "FK_3795f20551d11643bf8c439d579" FOREIGN KEY ("zone_id") REFERENCES "zones"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tickets" ADD CONSTRAINT "FK_52e690dbbbbfdb7f9f90b4b2bc9" FOREIGN KEY ("gate_id") REFERENCES "gates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "zones" ADD CONSTRAINT "FK_c35b0bb7fbe61ac4f9e0202e4bb" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_6d5b0346d09eb88c5c4db5ba84f" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_d0a95ef8a28188364c546eb65c1" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gate_zones" ADD CONSTRAINT "FK_113b162a9d9d2ea94ebf16f7fac" FOREIGN KEY ("gate_id") REFERENCES "gates"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "gate_zones" ADD CONSTRAINT "FK_ce0c6a4f89e9eddafde8a36e017" FOREIGN KEY ("zone_id") REFERENCES "zones"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "gate_zones" DROP CONSTRAINT "FK_ce0c6a4f89e9eddafde8a36e017"`);
        await queryRunner.query(`ALTER TABLE "gate_zones" DROP CONSTRAINT "FK_113b162a9d9d2ea94ebf16f7fac"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_d0a95ef8a28188364c546eb65c1"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_6d5b0346d09eb88c5c4db5ba84f"`);
        await queryRunner.query(`ALTER TABLE "zones" DROP CONSTRAINT "FK_c35b0bb7fbe61ac4f9e0202e4bb"`);
        await queryRunner.query(`ALTER TABLE "tickets" DROP CONSTRAINT "FK_52e690dbbbbfdb7f9f90b4b2bc9"`);
        await queryRunner.query(`ALTER TABLE "tickets" DROP CONSTRAINT "FK_3795f20551d11643bf8c439d579"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ce0c6a4f89e9eddafde8a36e01"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_113b162a9d9d2ea94ebf16f7fa"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ALTER COLUMN "currentCheckins" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ALTER COLUMN "active" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "createdAt" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "active" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "zones" ALTER COLUMN "open" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "zones" ALTER COLUMN "occupied" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "vacations" DROP COLUMN "active"`);
        await queryRunner.query(`ALTER TABLE "rush_hours" DROP COLUMN "active"`);
        await queryRunner.query(`CREATE INDEX "idx_subscriptions_category" ON "subscriptions" ("category_id") `);
        await queryRunner.query(`CREATE INDEX "idx_zones_category" ON "zones" ("category_id") `);
        await queryRunner.query(`CREATE INDEX "idx_tickets_checkout" ON "tickets" ("checkoutAt") `);
        await queryRunner.query(`CREATE INDEX "idx_tickets_gate" ON "tickets" ("gate_id") `);
        await queryRunner.query(`CREATE INDEX "idx_tickets_zone" ON "tickets" ("zone_id") `);
        await queryRunner.query(`ALTER TABLE "gate_zones" ADD CONSTRAINT "gate_zones_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "zones"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gate_zones" ADD CONSTRAINT "gate_zones_gate_id_fkey" FOREIGN KEY ("gate_id") REFERENCES "gates"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "zones" ADD CONSTRAINT "zones_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tickets" ADD CONSTRAINT "tickets_gate_id_fkey" FOREIGN KEY ("gate_id") REFERENCES "gates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tickets" ADD CONSTRAINT "tickets_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "zones"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
