import { MigrationInterface, QueryRunner } from "typeorm"

export class AddDenunciaTableAndRelationToPublicacao1737981438111 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(
        `CREATE TABLE "denuncia" (
                "id" SERIAL NOT NULL,
                "idUsuario" integer NOT NULL,
                "motivo" character varying(100) NOT NULL,
                "descricao" character varying(500) NOT NULL,
                "dataHora" TIMESTAMP NOT NULL,
                "publicacaoId" integer,
                CONSTRAINT "PK_7cc99af53579c9cb484791dbdeb" PRIMARY KEY ("id")
            )`
      );

      await queryRunner.query(
        `ALTER TABLE "denuncia"
             ADD CONSTRAINT "FK_denuncia_publicacaoId"
             FOREIGN KEY ("publicacaoId")
             REFERENCES "publicacao"("id")
             ON DELETE CASCADE`
      );



    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(
        `ALTER TABLE "denuncia" DROP CONSTRAINT "FK_denuncia_publicacaoId"`
      );

      // Remover tabela denuncia
      await queryRunner.query(`DROP TABLE "denuncia"`);
    }

}
