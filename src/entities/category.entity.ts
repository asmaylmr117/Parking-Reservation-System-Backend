import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Zone } from './zone.entity';
import { Subscription } from './subscription.entity';

@Entity('categories')
export class Category {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  rateNormal: number;

  @Column('decimal', { precision: 10, scale: 2 })
  rateSpecial: number;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => Zone, (zone) => zone.category)
  zones: Zone[];

  @OneToMany(() => Subscription, (subscription) => subscription.categoryEntity)
  subscriptions: Subscription[];
}