import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VacationsController } from './vacations.controller';
import { Vacation } from '../../entities/vacation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vacation])],
  controllers: [VacationsController],
})
export class VacationsModule {}