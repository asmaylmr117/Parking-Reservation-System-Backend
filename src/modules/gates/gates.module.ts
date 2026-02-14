import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GatesController } from './gates.controller';
import { Gate } from '../../entities/gate.entity';
import { ZonesModule } from '../zones/zones.module';

@Module({
  imports: [TypeOrmModule.forFeature([Gate]), ZonesModule],
  controllers: [GatesController],
})
export class GatesModule {}