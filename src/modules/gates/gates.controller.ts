import { Controller, Get, Param, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gate } from '../../entities/gate.entity';
import { ZonesService } from '../zones/zones.service';

@Controller('gates')
export class GatesController {
  constructor(
    @InjectRepository(Gate)
    private gateRepository: Repository<Gate>,
    private zonesService: ZonesService,
  ) {}

  @Get()
  async findAll() {
    const gates = await this.gateRepository.find({
      relations: ['zones'],
    });

    return gates.map((gate) => ({
      id: gate.id,
      name: gate.name,
      location: gate.location,
      zoneIds: gate.zones.map((z) => z.id),
    }));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const gate = await this.gateRepository.findOne({
      where: { id },
      relations: ['zones'],
    });

    if (!gate) {
      throw new HttpException(
        { status: 'error', message: 'Gate not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      id: gate.id,
      name: gate.name,
      location: gate.location,
      zoneIds: gate.zones.map((z) => z.id),
    };
  }

  @Get(':id/zones')
  async getGateZones(@Param('id') id: string) {
    const gate = await this.gateRepository.findOne({
      where: { id },
    });

    if (!gate) {
      throw new HttpException(
        { status: 'error', message: 'Gate not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    return await this.zonesService.findByGate(id);
  }
}