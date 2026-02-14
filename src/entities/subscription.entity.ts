import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Category } from './category.entity';

export interface Car {
  plate: string;
  brand: string;
  model: string;
  color: string;
}

export interface CurrentCheckin {
  ticketId: string;
  zoneId: string;
  checkinAt: string;
}

@Entity('subscriptions')
export class Subscription {
  @PrimaryColumn()
  id: string;

  @Column()
  userName: string;

  @Column({ default: true })
  active: boolean;

  @Column({ name: 'category_id' })
  category: string;

  @ManyToOne(() => Category, (category) => category.subscriptions)
  @JoinColumn({ name: 'category_id' })
  categoryEntity: Category;

  @Column({ type: 'jsonb' })
  cars: Car[];

  @Column({ type: 'timestamp' })
  startsAt: Date;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'jsonb', default: '[]' })
  currentCheckins: CurrentCheckin[];

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @ManyToOne(() => User, (user) => user.subscriptions, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;
}