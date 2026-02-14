import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { ZonesService } from '../zones/zones.service';

@Controller('tickets')
export class TicketsController {
  constructor(
    private readonly ticketsService: TicketsService,
    private readonly zonesService: ZonesService,
  ) {}

  @Post('checkin')
  async checkin(@Body() body: { zoneId: string; gateId: string; plate?: string }) {
    try {
      const result = await this.ticketsService.checkin(
        body.zoneId,
        body.gateId,
        body.plate,
      );

      const zone = await this.zonesService.findOne(body.zoneId);

      return {
        ticket: {
          id: result.ticket.id,
          type: result.ticket.type,
          checkinAt: result.ticket.checkinAt,
        },
        zone: zone,
        gate: { id: body.gateId },
        subscription: result.subscription || null,
      };
    } catch (error) {
      throw new HttpException(
        { status: 'error', message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('checkout')
  async checkout(@Body() body: { ticketId: string }) {
    try {
      const result = await this.ticketsService.checkout(body.ticketId);
      const ticket = await this.ticketsService.findOne(body.ticketId);
      const zoneState = await this.zonesService.findOne(ticket.zoneId);

      return {
        ...result,
        zoneState,
      };
    } catch (error) {
      throw new HttpException(
        { status: 'error', message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const ticket = await this.ticketsService.findOne(id);

    if (!ticket) {
      throw new HttpException(
        { status: 'error', message: 'Ticket not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    return ticket;
  }
}