const { MigrationInterface, QueryRunner } = require('typeorm');

module.exports = class AddPasswordToUser1712001400011 {
  name = 'AddPasswordToUser1712001400011';

  async up(queryRunner) {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "password" character varying NOT NULL`,
    );
  }

  async down(queryRunner) {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "password"`);
  }
};
