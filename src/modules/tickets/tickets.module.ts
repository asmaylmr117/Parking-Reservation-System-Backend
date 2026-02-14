import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { Ticket } from '../../entities/ticket.entity';
import { Zone } from '../../entities/zone.entity';
import { Category } from '../../entities/category.entity';
import { RushHour } from '../../entities/rush-hour.entity';
import { Vacation } from '../../entities/vacation.entity';
import { Subscription } from '../../entities/subscription.entity';
import { ZonesModule } from '../zones/zones.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Ticket,
      Zone,
      Category,
      RushHour,
      Vacation,
      Subscription,
    ]),
    ZonesModule,
  ],
  controllers: [TicketsController],
  providers: [TicketsService],
  exports: [TicketsService],
})
export class TicketsModule {}