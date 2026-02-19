import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('rush_hours')
export class RushHour {
  @PrimaryColumn()
  id: string;

  @Column()
  weekDay: number;

  @Column()
  from: string;

  @Column()
  to: string;

  @Column({ default: true })
  active: boolean;
}