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
import { UseGuards } from '@nestjs/common';
import { SocketAuthenticatedGuard } from 'src/auth/socket-auth.guard';

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

  @UseGuards(SocketAuthenticatedGuard)
  handleConnection(@ConnectedSocket() client: any) {
    console.log(client.request.user);
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

  // server에 접속해있는 모든 클라이언트에게 msg 보내기
  @SubscribeMessage('alarm')
  handleAlarm(@MessageBody() message: string) {
    this.server.emit('alarm', message);
  }

  // 게임 방에서 대화
  @SubscribeMessage('chat')
  async handleMessage(
    @MessageBody() { roomId, chat }: Chat,
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(roomId).emit('chat', `${client.id}:${chat}`);
  }

  /*
  // 게임 방 생성
  @SubscribeMessage('createRoom')
  async handleCreate(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    const room = await this.socketService.createRoom(data);
    client.emit('createRoom', room);
  }*/

  // 게임 방 입장
  @SubscribeMessage('enter')
  async handleEnter(
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

  // 게임방 퇴장
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

  // 게임 시작시 주제 단어 선정
  @SubscribeMessage('ready')
  async handleReady(@MessageBody() roomId: string) {
    if (this.roomInfo[roomId].round == 0) {
      this.roomInfo[roomId].word = await this.socketService.getWord(
        this.roomInfo[roomId].round,
      );
      this.server.to(roomId).emit('ready', this.roomInfo[roomId].word);
    }
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
    this.server.to(roomId).emit('answer', check);
  }
}
