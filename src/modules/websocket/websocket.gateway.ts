import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gate } from '../../entities/gate.entity';
import { Zone } from '../../entities/zone.entity';
import { ZonesService } from '../zones/zones.service';

@WebSocketGateway({ path: '/api/v1/ws' })
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private gateSubs: Map<string, Set<WebSocket>> = new Map();

  constructor(
    @InjectRepository(Gate)
    private gateRepository: Repository<Gate>,
    @InjectRepository(Zone)
    private zoneRepository: Repository<Zone>,
    private zonesService: ZonesService,
  ) {}

  handleConnection(client: WebSocket) {
    console.log('WebSocket client connected');
  }

  handleDisconnect(client: WebSocket) {
    // Remove from all gate subscriptions
    this.gateSubs.forEach((set) => {
      set.delete(client);
    });
    console.log('WebSocket client disconnected');
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() data: string,
    @ConnectedSocket() client: WebSocket,
  ) {
    try {
      const message = JSON.parse(data);

      if (message.type === 'subscribe' && message.payload?.gateId) {
        const gateId = message.payload.gateId;

        if (!this.gateSubs.has(gateId)) {
          this.gateSubs.set(gateId, new Set());
        }

        this.gateSubs.get(gateId).add(client);

        // Send initial zone updates for gate
        const gate = await this.gateRepository.findOne({
          where: { id: gateId },
          relations: ['zones'],
        });

        if (gate) {
          for (const zone of gate.zones) {
            const zoneData = await this.zonesService.computeZonePayload(zone);
            client.send(
              JSON.stringify({
                type: 'zone-update',
                payload: zoneData,
              }),
            );
          }
        }
      } else if (message.type === 'unsubscribe' && message.payload?.gateId) {
        const gateId = message.payload.gateId;
        if (this.gateSubs.has(gateId)) {
          this.gateSubs.get(gateId).delete(client);
        }
      }
    } catch (err) {
      console.error('WebSocket message error:', err);
    }
  }

  async broadcastZoneUpdate(zoneId: string) {
    const zone = await this.zoneRepository.findOne({
      where: { id: zoneId },
      relations: ['category', 'gates'],
    });

    if (!zone) return;

    const payload = await this.zonesService.computeZonePayload(zone);
    const message = JSON.stringify({ type: 'zone-update', payload });

    // Broadcast to all connections subscribed to gates that include this zone
    const gates = await this.gateRepository
      .createQueryBuilder('gate')
      .leftJoinAndSelect('gate.zones', 'zone')
      .where('zone.id = :zoneId', { zoneId })
      .getMany();

    gates.forEach((gate) => {
      const conns = this.gateSubs.get(gate.id);
      if (conns) {
        conns.forEach((ws) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(message);
          }
        });
      }
    });
  }

  broadcastAdminUpdate(payload: any) {
    const message = JSON.stringify({ type: 'admin-update', payload });

    // Broadcast to all connections
    this.gateSubs.forEach((set) => {
      set.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
        }
      });
    });
  }
}