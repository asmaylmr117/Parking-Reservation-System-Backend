import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('vacations')
export class Vacation {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  from: string;

  @Column()
  to: string;

  @Column({ default: true })
  active: boolean;
}