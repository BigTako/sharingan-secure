const { MigrationInterface, QueryRunner } = require('typeorm');

module.exports = class SetFullNameNullable1712046150287 {
  name = 'SetFullNameNullable1712046150287';

  async up(queryRunner) {
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "fullName" DROP NOT NULL`,
    );
  }

  async down(queryRunner) {
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "fullName" SET NOT NULL`,
    );
  }
};
