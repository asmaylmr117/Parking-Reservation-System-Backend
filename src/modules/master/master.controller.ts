import { Controller, Get, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gate } from '../../entities/gate.entity';
import { Category } from '../../entities/category.entity';
import { ZonesService } from '../zones/zones.service';

@Controller('master')
export class MasterController {
  constructor(
    @InjectRepository(Gate)
    private gateRepository: Repository<Gate>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private zonesService: ZonesService,
  ) {}

  @Get('gates')
  async getGates() {
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

  @Get('zones')
  async getZones(@Query('gateId') gateId?: string) {
    if (gateId) {
      return await this.zonesService.findByGate(gateId);
    }
    return await this.zonesService.findAll();
  }

  @Get('categories')
  async getCategories() {
    return await this.categoryRepository.find();
  }
}