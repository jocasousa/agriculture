import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1748281312851 implements MigrationInterface {
    name = 'Init1748281312851'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "producers" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "document" character varying NOT NULL,
                "name" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_55554aac38152436aa25b1e3530" UNIQUE ("document"),
                CONSTRAINT "PK_7f16886d1a44ed0974232b82506" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "producers"
        `);
    }

}
