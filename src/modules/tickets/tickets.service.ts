import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from '../../entities/ticket.entity';
import { Zone } from '../../entities/zone.entity';
import { Category } from '../../entities/category.entity';
import { RushHour } from '../../entities/rush-hour.entity';
import { Vacation } from '../../entities/vacation.entity';
import { Subscription } from '../../entities/subscription.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    @InjectRepository(Zone)
    private zoneRepository: Repository<Zone>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(RushHour)
    private rushHourRepository: Repository<RushHour>,
    @InjectRepository(Vacation)
    private vacationRepository: Repository<Vacation>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
  ) {}

  async checkin(zoneId: string, gateId: string, plate?: string) {
    const zone = await this.zoneRepository.findOne({
      where: { id: zoneId },
      relations: ['category'],
    });

    if (!zone) {
      throw new Error('Zone not found');
    }

    if (!zone.open) {
      throw new Error('Zone is closed');
    }

    let type = 'visitor';
    let subscription = null;

    if (plate) {
      subscription = await this.subscriptionRepository
        .createQueryBuilder('subscription')
        .where('subscription.active = :active', { active: true })
        .andWhere("subscription.cars::jsonb @> :car", { 
          car: JSON.stringify([{ plate }]) 
        })
        .getOne();

      if (subscription) {
        type = 'subscriber';
      }
    }

    const now = new Date();
    const free = zone.totalSlots - zone.occupied;

    if (free <= 0) {
      throw new Error('No available slots');
    }

    const ticket = this.ticketRepository.create({
      id: 't_' + uuidv4().split('-')[0],
      type,
      zoneId,
      gateId,
      checkinAt: now,
    });

    await this.ticketRepository.save(ticket);

    // Update zone occupied count
    zone.occupied += 1;
    await this.zoneRepository.save(zone);

    // Update subscription if subscriber
    if (subscription) {
      subscription.currentCheckins.push({
        ticketId: ticket.id,
        zoneId,
        checkinAt: now.toISOString(),
      });
      await this.subscriptionRepository.save(subscription);
    }

    return { ticket, subscription };
  }

  async checkout(ticketId: string) {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId },
      relations: ['zone', 'zone.category'],
    });

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    if (ticket.checkoutAt) {
      throw new Error('Ticket already checked out');
    }

    const now = new Date();
    ticket.checkoutAt = now;
    await this.ticketRepository.save(ticket);

    // Update zone occupied count
    const zone = ticket.zone;
    zone.occupied = Math.max(0, zone.occupied - 1);
    await this.zoneRepository.save(zone);

    // Update subscription if subscriber
    if (ticket.type === 'subscriber') {
      const subscription = await this.subscriptionRepository
        .createQueryBuilder('subscription')
        .where("subscription.currentCheckins::jsonb @> :checkin", {
          checkin: JSON.stringify([{ ticketId: ticket.id }])
        })
        .getOne();

      if (subscription) {
        subscription.currentCheckins = subscription.currentCheckins.filter(
          (c) => c.ticketId !== ticket.id,
        );
        await this.subscriptionRepository.save(subscription);
      }
    }

    // Calculate amount
    const breakdown = await this.calculateAmount(
      ticket.checkinAt,
      now,
      zone.category,
    );

    return {
      ticketId: ticket.id,
      checkinAt: ticket.checkinAt.toISOString(),
      checkoutAt: now.toISOString(),
      durationHours: +(
        (now.getTime() - ticket.checkinAt.getTime()) /
        3600000
      ).toFixed(4),
      breakdown,
      amount: +breakdown.reduce((sum, b) => sum + b.amount, 0).toFixed(2),
    };
  }

  private async calculateAmount(
    checkin: Date,
    checkout: Date,
    category: Category,
  ) {
    const breakdown = [];
    let currentTime = new Date(checkin);
    const endTime = new Date(checkout);

    const rushHours = await this.rushHourRepository.find();
    const vacations = await this.vacationRepository.find();

    while (currentTime < endTime) {
      const nextHour = new Date(currentTime);
      nextHour.setHours(nextHour.getHours() + 1);
      const segmentEnd = nextHour > endTime ? endTime : nextHour;

      const hours = (segmentEnd.getTime() - currentTime.getTime()) / 3600000;
      const isRushHour = this.isRushHour(currentTime, rushHours);
      const isVacation = this.isVacation(currentTime, vacations);

      let rate = category.rateNormal;
      if (isRushHour || isVacation) {
        rate = category.rateSpecial;
      }

      breakdown.push({
        from: currentTime.toISOString(),
        to: segmentEnd.toISOString(),
        hours: +hours.toFixed(4),
        rate,
        amount: +(hours * rate).toFixed(2),
        special: isRushHour || isVacation,
      });

      currentTime = segmentEnd;
    }

    return breakdown;
  }

  private isRushHour(time: Date, rushHours: RushHour[]): boolean {
    const weekDay = time.getDay();
    const timeStr = time.toTimeString().slice(0, 5);

    return rushHours.some((rh) => {
      if (rh.weekDay !== weekDay) return false;
      return timeStr >= rh.from && timeStr < rh.to;
    });
  }

  private isVacation(time: Date, vacations: Vacation[]): boolean {
    const dateStr = time.toISOString().split('T')[0];
    return vacations.some((v) => {
      const from = new Date(v.from).toISOString().split('T')[0];
      const to = new Date(v.to).toISOString().split('T')[0];
      return dateStr >= from && dateStr <= to;
    });
  }

  async findOne(id: string) {
    return await this.ticketRepository.findOne({
      where: { id },
    });
  }
}