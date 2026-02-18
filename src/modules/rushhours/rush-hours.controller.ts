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
import { RushHour } from '../../entities/rush-hour.entity';
import { AdminGuard } from '../../guards/auth.guard';
import { v4 as uuidv4 } from 'uuid';

@Controller('admin/rush-hours')
export class RushHoursController {
  constructor(
    @InjectRepository(RushHour)
    private rushHourRepository: Repository<RushHour>,
  ) {}

  @Get()
  async findAll() {
    return await this.rushHourRepository.find({
      order: { weekDay: 'ASC', from: 'ASC' },
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const rushHour = await this.rushHourRepository.findOne({
      where: { id },
    });

    if (!rushHour) {
      throw new HttpException(
        { status: 'error', message: 'Rush hour not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    return rushHour;
  }

  @Post()
  @UseGuards(AdminGuard)
  async create(@Body() body: any) {
    // Validate weekDay
    if (body.weekDay < 0 || body.weekDay > 6) {
      throw new HttpException(
        { status: 'error', message: 'Invalid weekDay. Must be 0-6 (0=Sunday, 6=Saturday)' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(body.from) || !timeRegex.test(body.to)) {
      throw new HttpException(
        { status: 'error', message: 'Invalid time format. Use HH:MM (24-hour format)' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validate time range
    if (body.from >= body.to) {
      throw new HttpException(
        { status: 'error', message: 'From time must be earlier than to time' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const rushHour = this.rushHourRepository.create({
      id: 'rush_' + uuidv4().split('-')[0],
      weekDay: body.weekDay,
      from: body.from,
      to: body.to,
      active: body.active !== undefined ? body.active : true,
    });

    return await this.rushHourRepository.save(rushHour);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  async update(@Param('id') id: string, @Body() body: any) {
    const rushHour = await this.rushHourRepository.findOne({
      where: { id },
    });

    if (!rushHour) {
      throw new HttpException(
        { status: 'error', message: 'Rush hour not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    // Update fields
    if (body.weekDay !== undefined) {
      if (body.weekDay < 0 || body.weekDay > 6) {
        throw new HttpException(
          { status: 'error', message: 'Invalid weekDay. Must be 0-6' },
          HttpStatus.BAD_REQUEST,
        );
      }
      rushHour.weekDay = body.weekDay;
    }

    if (body.from !== undefined) {
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!timeRegex.test(body.from)) {
        throw new HttpException(
          { status: 'error', message: 'Invalid time format for from. Use HH:MM' },
          HttpStatus.BAD_REQUEST,
        );
      }
      rushHour.from = body.from;
    }

    if (body.to !== undefined) {
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!timeRegex.test(body.to)) {
        throw new HttpException(
          { status: 'error', message: 'Invalid time format for to. Use HH:MM' },
          HttpStatus.BAD_REQUEST,
        );
      }
      rushHour.to = body.to;
    }

    if (body.active !== undefined) {
      rushHour.active = body.active;
    }

    // Validate time range after updates
    if (rushHour.from >= rushHour.to) {
      throw new HttpException(
        { status: 'error', message: 'From time must be earlier than to time' },
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.rushHourRepository.save(rushHour);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  async delete(@Param('id') id: string) {
    const rushHour = await this.rushHourRepository.findOne({
      where: { id },
    });

    if (!rushHour) {
      throw new HttpException(
        { status: 'error', message: 'Rush hour not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    await this.rushHourRepository.remove(rushHour);

    return {
      status: 'success',
      message: 'Rush hour deleted successfully',
    };
  }

  @Put(':id/toggle')
  @UseGuards(AdminGuard)
  async toggle(@Param('id') id: string) {
    const rushHour = await this.rushHourRepository.findOne({
      where: { id },
    });

    if (!rushHour) {
      throw new HttpException(
        { status: 'error', message: 'Rush hour not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    rushHour.active = !rushHour.active;

    return await this.rushHourRepository.save(rushHour);
  }
}