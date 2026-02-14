import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Zone } from './zone.entity';
import { Gate } from './gate.entity';

@Entity('tickets')
export class Ticket {
  @PrimaryColumn()
  id: string;

  @Column()
  type: string; // 'visitor' or 'subscriber'

  @Column({ name: 'zone_id' })
  zoneId: string;

  @ManyToOne(() => Zone, (zone) => zone.tickets)
  @JoinColumn({ name: 'zone_id' })
  zone: Zone;

  @Column({ name: 'gate_id' })
  gateId: string;

  @ManyToOne(() => Gate, (gate) => gate.tickets)
  @JoinColumn({ name: 'gate_id' })
  gate: Gate;

  @Column({ type: 'timestamp' })
  checkinAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  checkoutAt: Date;
}