import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminGuard } from '../../guards/auth.guard';
import { Category } from '../../entities/category.entity';
import { Zone } from '../../entities/zone.entity';
import { RushHour } from '../../entities/rush-hour.entity';
import { Vacation } from '../../entities/vacation.entity';
import { User } from '../../entities/user.entity';
import { Subscription } from '../../entities/subscription.entity';
import { ZonesService } from '../zones/zones.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { v4 as uuidv4 } from 'uuid';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Zone)
    private zoneRepository: Repository<Zone>,
    @InjectRepository(RushHour)
    private rushHourRepository: Repository<RushHour>,
    @InjectRepository(Vacation)
    private vacationRepository: Repository<Vacation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    private zonesService: ZonesService,
    private websocketGateway: WebsocketGateway,
  ) {}

  @Get('reports/parking-state')
  async getParkingState() {
    const zones = await this.zoneRepository.find();
    const report = await Promise.all(
      zones.map(async (zone) => {
        const state = await this.zonesService.computeZonePayload(zone);
        const subscriberCount = await this.subscriptionRepository.count({
          where: { category: zone.categoryId, active: true },
        });

        return {
          zoneId: zone.id,
          name: zone.name,
          totalSlots: zone.totalSlots,
          occupied: state.occupied,
          free: state.free,
          reserved: state.reserved,
          availableForVisitors: state.availableForVisitors,
          availableForSubscribers: state.availableForSubscribers,
          subscriberCount,
          open: zone.open,
        };
      }),
    );

    return report;
  }

  @Put('categories/:id')
  async updateCategory(
    @Param('id') id: string,
    @Body() body: any,
    @Request() req,
  ) {
    const category = await this.categoryRepository.findOne({ where: { id } });

    if (!category) {
      throw new HttpException(
        { status: 'error', message: 'Category not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    if (body.rateNormal !== undefined) category.rateNormal = body.rateNormal;
    if (body.rateSpecial !== undefined) category.rateSpecial = body.rateSpecial;
    if (body.name) category.name = body.name;
    if (body.description) category.description = body.description;

    await this.categoryRepository.save(category);

    // Broadcast admin update
    this.websocketGateway.broadcastAdminUpdate({
      adminId: req.user.id,
      action: 'category-rates-changed',
      targetType: 'category',
      targetId: id,
      details: {
        rateNormal: category.rateNormal,
        rateSpecial: category.rateSpecial,
      },
      timestamp: new Date().toISOString(),
    });

    return category;
  }

  @Put('zones/:id/open')
  async updateZoneOpen(
    @Param('id') id: string,
    @Body() body: { open: boolean },
    @Request() req,
  ) {
    const zone = await this.zoneRepository.findOne({ where: { id } });

    if (!zone) {
      throw new HttpException(
        { status: 'error', message: 'Zone not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    zone.open = !!body.open;
    await this.zoneRepository.save(zone);

    // Broadcast admin update
    this.websocketGateway.broadcastAdminUpdate({
      adminId: req.user.id,
      action: zone.open ? 'zone-opened' : 'zone-closed',
      targetType: 'zone',
      targetId: id,
      details: { open: zone.open },
      timestamp: new Date().toISOString(),
    });

    // Broadcast zone update
    this.websocketGateway.broadcastZoneUpdate(id);

    return { zoneId: zone.id, open: zone.open };
  }

  @Post('rush-hours')
  async createRushHour(@Body() body: any, @Request() req) {
    const rushHour = this.rushHourRepository.create({
      id: 'rush_' + uuidv4().split('-')[0],
      weekDay: body.weekDay,
      from: body.from,
      to: body.to,
    });

    await this.rushHourRepository.save(rushHour);

    this.websocketGateway.broadcastAdminUpdate({
      adminId: req.user.id,
      action: 'rush-updated',
      targetType: 'rush',
      targetId: rushHour.id,
      details: rushHour,
      timestamp: new Date().toISOString(),
    });

    return rushHour;
  }

  @Get('rush-hours')
  async getRushHours() {
    return await this.rushHourRepository.find();
  }

  @Post('vacations')
  async createVacation(@Body() body: any, @Request() req) {
    const vacation = this.vacationRepository.create({
      id: 'vac_' + uuidv4().split('-')[0],
      name: body.name,
      from: body.from,
      to: body.to,
    });

    await this.vacationRepository.save(vacation);

    this.websocketGateway.broadcastAdminUpdate({
      adminId: req.user.id,
      action: 'vacation-added',
      targetType: 'vacation',
      targetId: vacation.id,
      details: vacation,
      timestamp: new Date().toISOString(),
    });

    return vacation;
  }

  @Get('vacations')
  async getVacations() {
    return await this.vacationRepository.find();
  }

  @Get('subscriptions')
  async getSubscriptions() {
    return await this.subscriptionRepository.find();
  }

  @Get('users')
  async getUsers() {
    const users = await this.userRepository.find();
    return users.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email || '',
      fullName: u.fullName || '',
      phone: u.phone || '',
      companyName: u.companyName || '',
      role: u.role,
      active: u.active !== undefined ? u.active : true,
      createdAt: u.createdAt || '',
    }));
  }

  @Post('users')
  async createUser(@Body() body: any, @Request() req) {
    if (!body.username || !body.password) {
      throw new HttpException(
        { status: 'error', message: 'Username and password required' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const existing = await this.userRepository.findOne({
      where: { username: body.username },
    });

    if (existing) {
      throw new HttpException(
        { status: 'error', message: 'Username already exists' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const newUser = this.userRepository.create({
      id: 'user_' + uuidv4().split('-')[0],
      username: body.username,
      password: body.password,
      role: body.role || 'user',
      active: true,
    });

    await this.userRepository.save(newUser);

    this.websocketGateway.broadcastAdminUpdate({
      adminId: req.user.id,
      action: 'user-created',
      targetType: 'user',
      targetId: newUser.id,
      details: { username: newUser.username, role: newUser.role },
      timestamp: new Date().toISOString(),
    });

    return {
      id: newUser.id,
      username: newUser.username,
      role: newUser.role,
      active: newUser.active,
    };
  }

  @Put('users/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() body: any,
    @Request() req,
  ) {
    const targetUser = await this.userRepository.findOne({ where: { id } });

    if (!targetUser) {
      throw new HttpException(
        { status: 'error', message: 'User not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    if (body.username !== undefined) {
      const existing = await this.userRepository.findOne({
        where: { username: body.username },
      });

      if (existing && existing.id !== id) {
        throw new HttpException(
          { status: 'error', message: 'Username already exists' },
          HttpStatus.BAD_REQUEST,
        );
      }

      targetUser.username = body.username;
    }

    if (body.password !== undefined) targetUser.password = body.password;
    if (body.role !== undefined) targetUser.role = body.role;
    if (body.active !== undefined) targetUser.active = body.active;

    await this.userRepository.save(targetUser);

    this.websocketGateway.broadcastAdminUpdate({
      adminId: req.user.id,
      action: 'user-updated',
      targetType: 'user',
      targetId: id,
      details: { username: targetUser.username, role: targetUser.role },
      timestamp: new Date().toISOString(),
    });

    return {
      id: targetUser.id,
      username: targetUser.username,
      role: targetUser.role,
      active: targetUser.active,
    };
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string, @Request() req) {
    const targetUser = await this.userRepository.findOne({ where: { id } });

    if (!targetUser) {
      throw new HttpException(
        { status: 'error', message: 'User not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    if (req.user.id === id) {
      throw new HttpException(
        { status: 'error', message: 'Cannot delete your own account' },
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.userRepository.remove(targetUser);

    this.websocketGateway.broadcastAdminUpdate({
      adminId: req.user.id,
      action: 'user-deleted',
      targetType: 'user',
      targetId: id,
      details: { username: targetUser.username },
      timestamp: new Date().toISOString(),
    });

    return { success: true, message: 'User deleted successfully' };
  }
}