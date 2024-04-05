import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketService } from './socket.service';

interface Data {
  roomId: string | string[];
  message: string;
}
interface Info {
  roomId: string;
  idx: number;
}
@WebSocketGateway({ namespace: 'wakttu' })
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly socketService: SocketService) {}

  @WebSocketServer()
  public server: Server;

  public clients: {
    [socketId: string]: { roomId: string; idx: number };
  } = {};

  public rooms: {
    [roomId: string]: { idx: number; id: string }[];
  } = {};

  public turn: {
    [roomId: string]: number;
  } = {};

  handleConnection(client: Socket) {
    console.log('connect:', client.id);
  }

  afterInit() {
    console.log('socket is open!');
  }

  handleDisconnect(client: Socket) {
    const roomId = this.clients[client.id].roomId; // 오류로 소켓 종료시 접속중이던 room에서 삭제
    delete this.clients[client.id];
    if (roomId)
      this.rooms[roomId] = this.rooms[roomId].filter(
        (user) => user.id !== client.id,
      );
    console.log('disconnect:', client.id);
  }

  @SubscribeMessage('chat')
  async handleMessage(
    @MessageBody() { roomId, message }: Data,
    @ConnectedSocket() client: Socket,
  ) {
    console.log(roomId, message);
    if (this.turn[roomId as string] == this.clients[client.id].idx) {
      const response = await this.socketService.findWord(message);
      this.server.to(roomId).emit('game', JSON.stringify(response));
    }
    this.server.to(roomId).emit('chat', message);
  }

  @SubscribeMessage('enter')
  handleEnter(
    @MessageBody() { roomId, idx }: Info,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(roomId);
    this.clients[client.id] = { roomId, idx };
    this.server.to(roomId).emit('enter', `${client.id}이 입장`);
    this.rooms[roomId].push({ idx: idx, id: client.id });
    console.log(this.clients, this.rooms);
  }

  @SubscribeMessage('exit')
  handleExit(@MessageBody() roomId: string, @ConnectedSocket() client: Socket) {
    console.log('exit');
    client.leave(roomId);
    this.rooms[roomId] = this.rooms[roomId].filter(
      (user) => user.id !== client.id,
    );
    this.server.to(roomId).emit('exit', `${client.id}이 퇴장`);
  }

  //방설정확인
  @SubscribeMessage('status')
  handleStatus(@ConnectedSocket() client: Socket) {
    console.log(client.rooms);
  }

  handleTest(data: any, server) {
    console.log(data, server);
  }

  @SubscribeMessage('turn')
  handleTurn(
    @MessageBody() { roomId, idx }: Info,
    @ConnectedSocket() client: Socket,
  ) {
    this.turn[roomId] = idx;
    this.server.to(roomId).emit('turn', `Turn : ${client.id}`);
  }
}
