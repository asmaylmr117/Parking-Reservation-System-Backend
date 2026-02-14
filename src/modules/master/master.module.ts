import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterController } from './master.controller';
import { Gate } from '../../entities/gate.entity';
import { Category } from '../../entities/category.entity';
import { ZonesModule } from '../zones/zones.module';

@Module({
  imports: [TypeOrmModule.forFeature([Gate, Category]), ZonesModule],
  controllers: [MasterController],
})
export class MasterModule {}