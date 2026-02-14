import { Entity, Column, PrimaryColumn, ManyToOne, ManyToMany, OneToMany, JoinColumn } from 'typeorm';
import { Category } from './category.entity';
import { Gate } from './gate.entity';
import { Ticket } from './ticket.entity';

@Entity('zones')
export class Zone {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column({ name: 'category_id' })
  categoryId: string;

  @ManyToOne(() => Category, (category) => category.zones)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToMany(() => Gate, (gate) => gate.zones)
  gates: Gate[];

  @Column('int')
  totalSlots: number;

  @Column('int', { default: 0 })
  occupied: number;

  @Column('boolean', { default: true })
  open: boolean;

  @OneToMany(() => Ticket, (ticket) => ticket.zone)
  tickets: Ticket[];
}