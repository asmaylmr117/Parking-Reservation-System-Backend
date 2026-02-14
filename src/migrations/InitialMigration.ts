import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1234567890123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create categories table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR PRIMARY KEY,
        name VARCHAR NOT NULL,
        "rateNormal" DECIMAL(10,2) NOT NULL,
        "rateSpecial" DECIMAL(10,2) NOT NULL,
        description VARCHAR
      )
    `);

    // Create gates table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS gates (
        id VARCHAR PRIMARY KEY,
        name VARCHAR NOT NULL,
        location VARCHAR NOT NULL
      )
    `);

    // Create zones table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS zones (
        id VARCHAR PRIMARY KEY,
        name VARCHAR NOT NULL,
        category_id VARCHAR NOT NULL,
        "totalSlots" INTEGER NOT NULL,
        occupied INTEGER DEFAULT 0,
        open BOOLEAN DEFAULT true,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      )
    `);

    // Create gate_zones junction table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS gate_zones (
        gate_id VARCHAR NOT NULL,
        zone_id VARCHAR NOT NULL,
        PRIMARY KEY (gate_id, zone_id),
        FOREIGN KEY (gate_id) REFERENCES gates(id) ON DELETE CASCADE,
        FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE CASCADE
      )
    `);

    // Create rush_hours table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS rush_hours (
        id VARCHAR PRIMARY KEY,
        "weekDay" INTEGER NOT NULL,
        "from" VARCHAR NOT NULL,
        "to" VARCHAR NOT NULL
      )
    `);

    // Create vacations table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS vacations (
        id VARCHAR PRIMARY KEY,
        name VARCHAR NOT NULL,
        "from" DATE NOT NULL,
        "to" DATE NOT NULL
      )
    `);

    // Create users table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY,
        username VARCHAR UNIQUE NOT NULL,
        password VARCHAR NOT NULL,
        name VARCHAR,
        email VARCHAR,
        "fullName" VARCHAR,
        phone VARCHAR,
        "companyName" VARCHAR,
        role VARCHAR DEFAULT 'user',
        active BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create subscriptions table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id VARCHAR PRIMARY KEY,
        "userName" VARCHAR NOT NULL,
        active BOOLEAN DEFAULT true,
        category_id VARCHAR NOT NULL,
        cars JSONB NOT NULL,
        "startsAt" TIMESTAMP NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "currentCheckins" JSONB DEFAULT '[]',
        user_id VARCHAR,
        FOREIGN KEY (category_id) REFERENCES categories(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Create tickets table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id VARCHAR PRIMARY KEY,
        type VARCHAR NOT NULL,
        zone_id VARCHAR NOT NULL,
        gate_id VARCHAR NOT NULL,
        "checkinAt" TIMESTAMP NOT NULL,
        "checkoutAt" TIMESTAMP,
        FOREIGN KEY (zone_id) REFERENCES zones(id),
        FOREIGN KEY (gate_id) REFERENCES gates(id)
      )
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX idx_zones_category ON zones(category_id)`);
    await queryRunner.query(`CREATE INDEX idx_subscriptions_category ON subscriptions(category_id)`);
    await queryRunner.query(`CREATE INDEX idx_tickets_zone ON tickets(zone_id)`);
    await queryRunner.query(`CREATE INDEX idx_tickets_gate ON tickets(gate_id)`);
    await queryRunner.query(`CREATE INDEX idx_tickets_checkout ON tickets("checkoutAt")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS tickets CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS subscriptions CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS users CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS vacations CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS rush_hours CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS gate_zones CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS zones CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS gates CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS categories CASCADE`);
  }
}