import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('vacations')
export class Vacation {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column('date')
  from: Date;

  @Column('date')
  to: Date;

  @Column({ default: true })
  active: boolean;
}
