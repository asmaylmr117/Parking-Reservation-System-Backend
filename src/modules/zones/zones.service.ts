import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Zone } from '../../entities/zone.entity';
import { Category } from '../../entities/category.entity';
import { Subscription } from '../../entities/subscription.entity';
import { Ticket } from '../../entities/ticket.entity';

@Injectable()
export class ZonesService {
  constructor(
    @InjectRepository(Zone)
    private zoneRepository: Repository<Zone>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
  ) {}

  async findAll(): Promise<any[]> {
    const zones = await this.zoneRepository.find({
      relations: ['category', 'gates'],
    });

    const zonesWithState = await Promise.all(
      zones.map(async (zone) => await this.computeZonePayload(zone)),
    );

    return zonesWithState;
  }

  async findByGate(gateId: string): Promise<any[]> {
    const zones = await this.zoneRepository
      .createQueryBuilder('zone')
      .leftJoinAndSelect('zone.category', 'category')
      .leftJoinAndSelect('zone.gates', 'gate')
      .where('gate.id = :gateId', { gateId })
      .getMany();

    const zonesWithState = await Promise.all(
      zones.map(async (zone) => await this.computeZonePayload(zone)),
    );

    return zonesWithState;
  }

  async findOne(id: string): Promise<any> {
    const zone = await this.zoneRepository.findOne({
      where: { id },
      relations: ['category', 'gates'],
    });

    if (!zone) {
      return null;
    }

    return await this.computeZonePayload(zone);
  }

  private async computeReservedForCategory(categoryId: string): Promise<number> {
    const subscriptions = await this.subscriptionRepository.find({
      where: { category: categoryId, active: true },
    });

    let checkedInCount = 0;
    subscriptions.forEach((sub) => {
      if (sub.currentCheckins && sub.currentCheckins.length > 0) {
        checkedInCount += sub.currentCheckins.length;
      }
    });

    const subscribersOutside = subscriptions.length - checkedInCount;
    const reserved = Math.ceil(subscribersOutside * 0.15);
    return Math.min(reserved, 1000000);
  }

  async computeZonePayload(zone: Zone): Promise<any> {
    const reserved = await this.computeReservedForCategory(zone.categoryId);
    const occupied = zone.occupied || 0;
    const total = zone.totalSlots || 0;
    const free = Math.max(0, total - occupied);

    const reservedOccupied = await this.ticketRepository.count({
      where: {
        zoneId: zone.id,
        type: 'subscriber',
        checkoutAt: null,
      },
    });

    const reservedFree = Math.max(0, reserved - reservedOccupied);
    let availableForVisitors = Math.max(0, free - reservedFree);
    const finalReserved = Math.min(reserved, total);
    const availableForSubscribers = free;

    const category = await this.categoryRepository.findOne({
      where: { id: zone.categoryId },
    });

    const gateIds = zone.gates ? zone.gates.map((g) => g.id) : [];

    return {
      id: zone.id,
      name: zone.name,
      categoryId: zone.categoryId,
      gateIds,
      totalSlots: zone.totalSlots,
      occupied,
      free,
      reserved: finalReserved,
      availableForVisitors,
      availableForSubscribers,
      rateNormal: category ? category.rateNormal : 0,
      rateSpecial: category ? category.rateSpecial : 0,
      open: zone.open,
    };
  }
}