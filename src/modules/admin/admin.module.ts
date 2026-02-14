import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { Category } from '../../entities/category.entity';
import { Zone } from '../../entities/zone.entity';
import { RushHour } from '../../entities/rush-hour.entity';
import { Vacation } from '../../entities/vacation.entity';
import { User } from '../../entities/user.entity';
import { Subscription } from '../../entities/subscription.entity';
import { ZonesModule } from '../zones/zones.module';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Category,
      Zone,
      RushHour,
      Vacation,
      User,
      Subscription,
    ]),
    ZonesModule,
    WebsocketModule,
  ],
  controllers: [AdminController],
})
export class AdminModule {}