import { Entity, Column, PrimaryColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Zone } from './zone.entity';
import { Ticket } from './ticket.entity';

@Entity('gates')
export class Gate {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  location: string;

  @ManyToMany(() => Zone, (zone) => zone.gates)
  @JoinTable({
    name: 'gate_zones',
    joinColumn: { name: 'gate_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'zone_id', referencedColumnName: 'id' },
  })
  zones: Zone[];

  @OneToMany(() => Ticket, (ticket) => ticket.gate)
  tickets: Ticket[];
}