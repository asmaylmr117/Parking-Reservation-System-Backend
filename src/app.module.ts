import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { dataSourceOptions } from './config/typeorm.config';
import { AuthModule } from './modules/auth/auth.module';
import { ZonesModule } from './modules/zones/zones.module';
import { GatesModule } from './modules/gates/gates.module';
import { MasterModule } from './modules/master/master.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { AdminModule } from './modules/admin/admin.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { WebsocketModule } from './modules/websocket/websocket.module';
import { RushHoursModule } from './modules/rushhours/rush-hours.module';
import { VacationsModule } from './modules/vacations/vacations.module';
import { AuthGuard } from './guards/auth.guard';
import { User } from './entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    TypeOrmModule.forFeature([User]),
    AuthModule,
    MasterModule,
    ZonesModule,
    GatesModule,
    TicketsModule,
    AdminModule,
    RushHoursModule,
    VacationsModule,
    SubscriptionsModule,
    WebsocketModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}