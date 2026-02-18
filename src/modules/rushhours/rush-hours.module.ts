import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RushHoursController } from './rush-hours.controller';
import { RushHour } from '../../entities/rush-hour.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RushHour])],
  controllers: [RushHoursController],
})
export class RushHoursModule {}