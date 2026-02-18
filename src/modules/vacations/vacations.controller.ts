import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vacation } from '../../entities/vacation.entity';
import { AdminGuard } from '../../guards/auth.guard';
import { v4 as uuidv4 } from 'uuid';

@Controller('admin/vacations')
export class VacationsController {
  constructor(
    @InjectRepository(Vacation)
    private vacationRepository: Repository<Vacation>,
  ) {}

  @Get()
  async findAll() {
    return await this.vacationRepository.find({
      order: { from: 'DESC' },
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const vacation = await this.vacationRepository.findOne({
      where: { id },
    });

    if (!vacation) {
      throw new HttpException(
        { status: 'error', message: 'Vacation not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    return vacation;
  }

  @Post()
  @UseGuards(AdminGuard)
  async create(@Body() body: any) {
    // Validate required fields
    if (!body.name || !body.from || !body.to) {
      throw new HttpException(
        { status: 'error', message: 'Missing required fields: name, from, to' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validate date range
    const fromDate = new Date(body.from);
    const toDate = new Date(body.to);

    if (fromDate >= toDate) {
      throw new HttpException(
        { status: 'error', message: 'From date must be earlier than to date' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const vacation = this.vacationRepository.create({
      id: 'vac_' + uuidv4().split('-')[0],
      name: body.name,
      from: body.from,
      to: body.to,
      active: body.active !== undefined ? body.active : true,
    });

    return await this.vacationRepository.save(vacation);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  async update(@Param('id') id: string, @Body() body: any) {
    const vacation = await this.vacationRepository.findOne({
      where: { id },
    });

    if (!vacation) {
      throw new HttpException(
        { status: 'error', message: 'Vacation not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    // Update fields
    if (body.name !== undefined) vacation.name = body.name;
    if (body.from !== undefined) vacation.from = body.from;
    if (body.to !== undefined) vacation.to = body.to;
    if (body.active !== undefined) vacation.active = body.active;

    // Validate date range after updates
    const fromDate = new Date(vacation.from);
    const toDate = new Date(vacation.to);

    if (fromDate >= toDate) {
      throw new HttpException(
        { status: 'error', message: 'From date must be earlier than to date' },
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.vacationRepository.save(vacation);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  async delete(@Param('id') id: string) {
    const vacation = await this.vacationRepository.findOne({
      where: { id },
    });

    if (!vacation) {
      throw new HttpException(
        { status: 'error', message: 'Vacation not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    await this.vacationRepository.remove(vacation);

    return {
      status: 'success',
      message: 'Vacation deleted successfully',
    };
  }

  @Put(':id/toggle')
  @UseGuards(AdminGuard)
  async toggle(@Param('id') id: string) {
    const vacation = await this.vacationRepository.findOne({
      where: { id },
    });

    if (!vacation) {
      throw new HttpException(
        { status: 'error', message: 'Vacation not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    vacation.active = !vacation.active;

    return await this.vacationRepository.save(vacation);
  }
}