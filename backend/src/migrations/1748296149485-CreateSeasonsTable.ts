import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSeasonsTable1748296149485 implements MigrationInterface {
    name = 'CreateSeasonsTable1748296149485'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "cultivations" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "crop" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "farmId" uuid,
                "seasonId" uuid,
                CONSTRAINT "PK_b28ad6f7b0b4076361b0ce43c2a" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "seasons" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "year" integer NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_e20814074bbf37638cb4affa089" UNIQUE ("year"),
                CONSTRAINT "PK_cb8ed53b5fe109dcd4a4449ec9d" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "cultivations"
            ADD CONSTRAINT "FK_ec7866585864c660fb63a58544c" FOREIGN KEY ("farmId") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "cultivations"
            ADD CONSTRAINT "FK_9b174360e2b933b917da5edae02" FOREIGN KEY ("seasonId") REFERENCES "seasons"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "cultivations" DROP CONSTRAINT "FK_9b174360e2b933b917da5edae02"
        `);
        await queryRunner.query(`
            ALTER TABLE "cultivations" DROP CONSTRAINT "FK_ec7866585864c660fb63a58544c"
        `);
        await queryRunner.query(`
            DROP TABLE "seasons"
        `);
        await queryRunner.query(`
            DROP TABLE "cultivations"
        `);
    }

}
