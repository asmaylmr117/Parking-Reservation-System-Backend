import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminZonesController } from './zones.controller';
import { ZonesService } from './zones.service';
import { Zone } from '../../entities/zone.entity';
import { Category } from '../../entities/category.entity';
import { Subscription } from '../../entities/subscription.entity';
import { Ticket } from '../../entities/ticket.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Zone, Category, Subscription, Ticket])],
  controllers: [AdminZonesController],
  providers: [ZonesService],
  exports: [ZonesService],
})
export class ZonesModule {}