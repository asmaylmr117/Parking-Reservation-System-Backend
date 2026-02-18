import { 
  Controller, 
  Get, 
  Post,
  Put,
  Delete,
  Param, 
  Body,
  UseGuards,
  HttpException, 
  HttpStatus 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Zone } from '../../entities/zone.entity';
import { AdminGuard } from '../../guards/auth.guard';
import { v4 as uuidv4 } from 'uuid';

@Controller('admin/zones')
export class AdminZonesController {
  constructor(
    @InjectRepository(Zone)
    private zoneRepository: Repository<Zone>,
  ) {}

  @Get()
  async findAll() {
    return await this.zoneRepository.find({
      order: { name: 'ASC' },
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const zone = await this.zoneRepository.findOne({
      where: { id },
    });
    
    if (!zone) {
      throw new HttpException(
        { status: 'error', message: 'Zone not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    return zone;
  }

 @Post()
@UseGuards(AdminGuard)
async create(@Body() body: any) {
  if (!body.name || !body.categoryId || !body.gateIds) {
    throw new HttpException(
      { status: 'error', message: 'Missing required fields: name, categoryId, gateIds' },
      HttpStatus.BAD_REQUEST,
    );
  }

  const zone = this.zoneRepository.create({
    id: 'zone_' + uuidv4().split('-')[0],
    name: body.name,
    categoryId: body.categoryId,
    totalSlots: body.totalSlots,
    open: body.open ?? true,
    occupied: 0,
  });

  // ربط الـ gates
  zone.gates = body.gateIds.map((id: string) => ({ id }));

  return await this.zoneRepository.save(zone);
}


  @Put(':id')
  @UseGuards(AdminGuard)
  async update(@Param('id') id: string, @Body() body: any) {
    const zone = await this.zoneRepository.findOne({
      where: { id },
    });

    if (!zone) {
      throw new HttpException(
        { status: 'error', message: 'Zone not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    // Update fields
    if (body.name !== undefined) zone.name = body.name;
  if (body.gateIds !== undefined) {
  zone.gates = body.gateIds.map((id: string) => ({ id }));
}
    if (body.categoryId !== undefined) zone.categoryId = body.categoryId;
    
    if (body.totalSlots !== undefined) {
      if (body.totalSlots <= 0) {
        throw new HttpException(
          { status: 'error', message: 'Total slots must be greater than 0' },
          HttpStatus.BAD_REQUEST,
        );
      }
      
      // Validate that totalSlots >= occupied
      if (body.totalSlots < zone.occupied) {
        throw new HttpException(
          { status: 'error', message: `Cannot reduce slots below current occupancy (${zone.occupied})` },
          HttpStatus.BAD_REQUEST,
        );
      }
      
      zone.totalSlots = body.totalSlots;
    }

    if (body.open !== undefined) zone.open = body.open;

    return await this.zoneRepository.save(zone);
  }

  @Put(':id/toggle')
  @UseGuards(AdminGuard)
  async toggleOpen(@Param('id') id: string, @Body() body: { open: boolean }) {
    const zone = await this.zoneRepository.findOne({
      where: { id },
    });

    if (!zone) {
      throw new HttpException(
        { status: 'error', message: 'Zone not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    zone.open = body.open !== undefined ? body.open : !zone.open;

    return await this.zoneRepository.save(zone);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  async delete(@Param('id') id: string) {
    const zone = await this.zoneRepository.findOne({
      where: { id },
    });

    if (!zone) {
      throw new HttpException(
        { status: 'error', message: 'Zone not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    // Check if zone has active tickets
    if (zone.occupied > 0) {
      throw new HttpException(
        { status: 'error', message: 'Cannot delete zone with active tickets' },
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.zoneRepository.remove(zone);

    return {
      status: 'success',
      message: 'Zone deleted successfully',
    };
  }

  @Post('bulk/toggle')
  @UseGuards(AdminGuard)
  async bulkToggle(@Body() body: { zoneIds: string[], open: boolean }) {
    if (!body.zoneIds || body.zoneIds.length === 0) {
      throw new HttpException(
        { status: 'error', message: 'No zones provided' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const zones = await this.zoneRepository.findByIds(body.zoneIds);

    zones.forEach(zone => {
      zone.open = body.open;
    });

    await this.zoneRepository.save(zones);

    return {
      status: 'success',
      message: `${zones.length} zones updated`,
      zones,
    };
  }
}