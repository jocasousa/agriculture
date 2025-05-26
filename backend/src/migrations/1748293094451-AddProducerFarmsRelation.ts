import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProducerFarmsRelation1748293094451 implements MigrationInterface {
    name = 'AddProducerFarmsRelation1748293094451'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "farms" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "city" character varying NOT NULL,
                "state" character varying NOT NULL,
                "totalArea" double precision NOT NULL,
                "arableArea" double precision NOT NULL,
                "vegetationArea" double precision NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "producerId" uuid,
                CONSTRAINT "PK_39aff9c35006b14025bba5a43d9" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "farms"
            ADD CONSTRAINT "FK_a47fa1b0ccf320f4028705ca3dd" FOREIGN KEY ("producerId") REFERENCES "producers"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "farms" DROP CONSTRAINT "FK_a47fa1b0ccf320f4028705ca3dd"
        `);
        await queryRunner.query(`
            DROP TABLE "farms"
        `);
    }

}
