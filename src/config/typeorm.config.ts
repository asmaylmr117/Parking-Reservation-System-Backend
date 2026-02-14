import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { Category } from '../entities/category.entity';
import { Gate } from '../entities/gate.entity';
import { Zone } from '../entities/zone.entity';
import { RushHour } from '../entities/rush-hour.entity';
import { Vacation } from '../entities/vacation.entity';
import { User } from '../entities/user.entity';
import { Subscription } from '../entities/subscription.entity';
import { Ticket } from '../entities/ticket.entity';

config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Category, Gate, Zone, RushHour, Vacation, User, Subscription, Ticket],
  migrations: ['dist/migrations/*.js'],
  synchronize: false, 
  logging: process.env.NODE_ENV === 'development',
  ssl: {
    rejectUnauthorized: false,
  },
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;