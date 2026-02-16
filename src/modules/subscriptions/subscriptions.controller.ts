import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from '../../entities/subscription.entity';
import { AdminGuard } from '../../guards/auth.guard';
import { v4 as uuidv4 } from 'uuid';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
  ) {}

  @Get()
  async findAll() {
    return await this.subscriptionRepository.find();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id },
    });

    if (!subscription) {
      throw new HttpException(
        { status: 'error', message: 'Subscription not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    return subscription;
  }

  @Get('plate/:plate')
  async findByPlate(@Param('plate') plate: string) {
    const subscription = await this.subscriptionRepository
      .createQueryBuilder('subscription')
      .where('subscription.active = :active', { active: true })
      .andWhere("subscription.cars::jsonb @> :car", {
        car: JSON.stringify([{ plate }]),
      })
      .getOne();

    if (!subscription) {
      throw new HttpException(
        { status: 'error', message: 'No active subscription found for this plate' },
        HttpStatus.NOT_FOUND,
      );
    }

    return subscription;
  }

  @Post()
  @UseGuards(AdminGuard)
  async create(@Body() body: any, @Request() req) {
    const subscription = this.subscriptionRepository.create({
      id: 'sub_' + uuidv4().split('-')[0],
      userName: body.userName,
      active: body.active !== undefined ? body.active : true,
      category: body.category,
      cars: body.cars || [],
      startsAt: body.startsAt,
      expiresAt: body.expiresAt,
      currentCheckins: [],
      userId: body.userId,
    });

    return await this.subscriptionRepository.save(subscription);
  }
}