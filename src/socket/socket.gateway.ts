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

interface Chat {
  roomId: string;
  chat: string;
}

@WebSocketGateway({ namespace: 'wakttu' })
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly socketService: SocketService) {}

  @WebSocketServer()
  public server: Server;

  public clients: {
    [socketId: string]: string;
  } = {};

  public roomUser: {
    [roomId: string]: string[];
  } = {};

  public roomInfo: {
    [roomId: string]: {
      title: string;
      type: string;
      users: any;
      option: string[];
      host: string | undefined;
      round: number;
      word: string;
      password: string;
    };
  } = {};
  public turn: {
    [roomId: string]: string;
  } = {};

  handleConnection(client: Socket) {
    console.log('connect:', client.id);
  }

  afterInit() {
    console.log('socket is open!');
  }

  handleDisconnect(client: Socket) {
    const roomId = this.clients[client.id]; // 오류로 소켓 종료시 접속중이던 room에서 삭제
    delete this.clients[client.id];
    if (roomId)
      this.roomUser[roomId] = this.roomUser[roomId].filter(
        (id) => id !== client.id,
      );
    this.server.to(roomId).emit('list', JSON.stringify(this.roomUser[roomId]));
    console.log('disconnect:', client.id);
  }

  @SubscribeMessage('chat')
  async handleMessage(
    @MessageBody() { roomId, chat }: Chat,
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(roomId).emit('chat', `${client.id}:${chat}`);
  }

  @SubscribeMessage('createRoom')
  async handleCreate(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    console.log(data);
    const room = await this.socketService.createRoom(data);
    client.emit(JSON.stringify(room));
  }

  @SubscribeMessage('enter')
  handleEnter(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (client.rooms.has(roomId)) {
      return;
    }
    client.join(roomId);
    this.clients[client.id] = roomId;

    if (!this.roomUser[roomId]) {
      this.roomUser[roomId] = [];
    }

    this.roomUser[roomId] = [client.id];
    this.server.to(roomId).emit('list', JSON.stringify(this.roomUser[roomId]));
    this.server.to(roomId).emit('enter', `${client.id}이 입장`);
  }

  @SubscribeMessage('exit')
  handleExit(@MessageBody() roomId: string, @ConnectedSocket() client: Socket) {
    console.log('exit');
    if (!client.rooms.has(roomId)) {
      return;
    }
    client.leave(roomId);
    this.roomUser[roomId] = this.roomUser[roomId].filter(
      (id) => id !== client.id,
    );
    this.server.to(roomId).emit('list', JSON.stringify(this.roomUser[roomId]));
    this.server.to(roomId).emit('exit', `${client.id}이 퇴장`);
  }

  @SubscribeMessage('ready')
  async handleReady(@MessageBody() roomId: string) {
    if (this.roomInfo[roomId].round == 0) {
      this.roomInfo[roomId].word = await this.socketService.getWord(
        this.roomInfo[roomId].round,
      );
      this.server.to(roomId).emit('ready', this.roomInfo[roomId].word);
    }
  }

  @SubscribeMessage('turn_start')
  handleTurnStart(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    this.turn[roomId] = client.id;
    this.server.to(roomId).emit('turn_start', `${client.id}님 턴!`);
  }

  @SubscribeMessage('turn_end')
  handleTurnEnd(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    this.turn[roomId] = null;
    this.server.to(roomId).emit('turn_end', `${client.id}님 턴 종료!`);
  }

  @SubscribeMessage('answer')
  async handleAnswer(
    @MessageBody() { roomId, chat }: Chat,
    @ConnectedSocket() client: Socket,
  ) {
    if (this.turn[roomId] !== client.id) {
      return;
    }
    const check = await this.socketService.findWord(chat);
    this.server.to(roomId).emit('answer', JSON.stringify(check));
  }
}
