import { Controller, Get, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ZonesService } from './zones.service';

@Controller('zones')
export class ZonesController {
  constructor(private readonly zonesService: ZonesService) {}

  @Get()
  async findAll() {
    return await this.zonesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const zone = await this.zonesService.findOne(id);
    
    if (!zone) {
      throw new HttpException(
        { status: 'error', message: 'Zone not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    return zone;
  }
}