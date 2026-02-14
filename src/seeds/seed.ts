import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../config/typeorm.config';
import seedData from '../seed.json';

async function seed() {
  const dataSource = new DataSource(dataSourceOptions);
  await dataSource.initialize();

  try {
    console.log('Starting database seeding...');

    // Clear existing data
    await dataSource.query('TRUNCATE TABLE tickets CASCADE');
    await dataSource.query('TRUNCATE TABLE subscriptions CASCADE');
    await dataSource.query('TRUNCATE TABLE users CASCADE');
    await dataSource.query('TRUNCATE TABLE vacations CASCADE');
    await dataSource.query('TRUNCATE TABLE rush_hours CASCADE');
    await dataSource.query('TRUNCATE TABLE gate_zones CASCADE');
    await dataSource.query('TRUNCATE TABLE zones CASCADE');
    await dataSource.query('TRUNCATE TABLE gates CASCADE');
    await dataSource.query('TRUNCATE TABLE categories CASCADE');

    // =============================
    // Categories
    // =============================
    for (const cat of seedData.categories) {
      await dataSource.query(
        `INSERT INTO categories (id, name, "rateNormal", "rateSpecial", description)
         VALUES ($1, $2, $3, $4, $5)`,
        [cat.id, cat.name, cat.rateNormal, cat.rateSpecial, null],
      );
    }
    console.log('✓ Categories seeded');

    // =============================
    // Gates
    // =============================
    for (const gate of seedData.gates) {
      await dataSource.query(
        `INSERT INTO gates (id, name, location)
         VALUES ($1, $2, $3)`,
        [gate.id, gate.name, gate.location],
      );
    }
    console.log('✓ Gates seeded');

    // =============================
    // Zones
    // =============================
    for (const zone of seedData.zones) {
      await dataSource.query(
        `INSERT INTO zones (id, name, category_id, "totalSlots", occupied, open)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          zone.id,
          zone.name,
          zone.categoryId,
          zone.totalSlots,
          zone.occupied,
          zone.open,
        ],
      );
    }
    console.log('✓ Zones seeded');

    // =============================
    // Gate-Zone relationships
    // =============================
    for (const gate of seedData.gates) {
      for (const zoneId of gate.zoneIds) {
        await dataSource.query(
          `INSERT INTO gate_zones (gate_id, zone_id)
           VALUES ($1, $2)`,
          [gate.id, zoneId],
        );
      }
    }
    console.log('✓ Gate-Zone relationships seeded');

    // =============================
    // Rush Hours
    // =============================
    for (const rush of seedData.rushHours) {
      await dataSource.query(
        `INSERT INTO rush_hours (id, "weekDay", "from", "to")
         VALUES ($1, $2, $3, $4)`,
        [rush.id, rush.weekDay, rush.from, rush.to],
      );
    }
    console.log('✓ Rush hours seeded');

    // =============================
    // Vacations
    // =============================
    for (const vac of seedData.vacations) {
      await dataSource.query(
        `INSERT INTO vacations (id, name, "from", "to")
         VALUES ($1, $2, $3, $4)`,
        [vac.id, vac.name, vac.from, vac.to],
      );
    }
    console.log('✓ Vacations seeded');

    // =============================
    // Users
    // =============================
    for (const user of seedData.users) {
      await dataSource.query(
        `INSERT INTO users (id, username, password, name, role, active, "createdAt")
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [
          user.id,
          user.username,
          user.password,
          user.name,
          user.role,
          true,
        ],
      );
    }
    console.log('✓ Users seeded');

    // =============================
    // Subscriptions (FIXED HERE)
    // =============================
    for (const sub of seedData.subscriptions) {
      await dataSource.query(
        `INSERT INTO subscriptions 
         (id, "userName", active, category_id, cars, "startsAt", "expiresAt", "currentCheckins")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          sub.id,
          sub.userName,
          sub.active,
          sub.category, // ده بيروح في category_id
          JSON.stringify(sub.cars),
          sub.startsAt,
          sub.expiresAt,
          JSON.stringify(sub.currentCheckins ?? []),
        ],
      );
    }
    console.log('✓ Subscriptions seeded');

    // =============================
    // Tickets
    // =============================
    for (const ticket of seedData.tickets) {
      await dataSource.query(
        `INSERT INTO tickets 
         (id, type, zone_id, gate_id, "checkinAt", "checkoutAt")
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          ticket.id,
          ticket.type,
          ticket.zoneId,
          ticket.gateId,
          ticket.checkinAt,
          ticket.checkoutAt,
        ],
      );
    }
    console.log('✓ Tickets seeded');

    console.log('\n✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await dataSource.destroy();
  }
}

seed();
