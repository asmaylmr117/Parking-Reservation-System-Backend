import {
  Controller,
  Get,
  Post,
  Put,
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
import { generateSubscriptionId, isValidSubscriptionId } from '../../utils/id-generator.util';

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
    // Generate ultra-secure subscription ID
    const secureId = generateSubscriptionId();

    const subscription = this.subscriptionRepository.create({
      id: secureId,
      userName: body.userName,
      active: body.active !== undefined ? body.active : true,
      category: body.category,
      cars: body.cars || [],
      startsAt: body.startsAt,
      expiresAt: body.expiresAt,
      currentCheckins: [],
      userId: body.userId,
    });

    const savedSubscription = await this.subscriptionRepository.save(subscription);

    // Return subscription with masked ID for display
    return {
      ...savedSubscription,
      displayId: this.maskSubscriptionId(savedSubscription.id),
    };
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  async update(@Param('id') id: string, @Body() body: any) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id },
    });

    if (!subscription) {
      throw new HttpException(
        { status: 'error', message: 'Subscription not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    // Update subscription fields
    subscription.userName = body.userName !== undefined ? body.userName : subscription.userName;
    subscription.active = body.active !== undefined ? body.active : subscription.active;
    subscription.category = body.category !== undefined ? body.category : subscription.category;
    subscription.cars = body.cars !== undefined ? body.cars : subscription.cars;
    subscription.startsAt = body.startsAt !== undefined ? body.startsAt : subscription.startsAt;
    subscription.expiresAt = body.expiresAt !== undefined ? body.expiresAt : subscription.expiresAt;

    const updatedSubscription = await this.subscriptionRepository.save(subscription);

    return {
      ...updatedSubscription,
      displayId: this.maskSubscriptionId(updatedSubscription.id),
    };
  }

  // Helper method to mask ID for display
  private maskSubscriptionId(id: string): string {
    const parts = id.split('-');
    if (parts.length < 6) return id;
    return `${parts[0]}-${parts[1]}-${parts[2]}-*****-*****-${parts[5]}`;
  }
}