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
import { CreateRoomDto } from 'src/room/dto/create-room.dto';
import { Room } from 'src/room/entities/room.entity';

interface Chat {
  roomId: string;
  chat: string;
}

@UseGuards(SocketAuthenticatedGuard)
@WebSocketGateway({ namespace: 'wakttu' })
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly socketService: SocketService) {}

  @WebSocketServer()
  public server: Server;

  public user: {
    [socketId: string]: any;
  } = {};

  public roomInfo: {
    [roomId: string]: Room;
  } = {};
  public turn: {
    [roomId: string]: string;
  } = {};

  handleConnection(@ConnectedSocket() client: any) {
    if (!client.request.user) return;
    this.user[client.id] = client.request.user;
    console.log('connect:', this.user[client.id].name);
    this.server.emit('list', this.user);
  }

  async afterInit() {
    await this.socketService.deleteAllRoom();
    console.log('socket is open!');
  }

  async handleDisconnect(client: any) {
    if (!client.request.user) return;
    const roomId = this.user[client.id].roomId;
    if (roomId) {
      await this.socketService.exitRoom(this.user[client.id].id);
      this.roomInfo[roomId] = await this.socketService.getRoom(roomId);
      console.log('disconnect:', this.user[client.id].name);
      if (this.roomInfo[roomId].users.length > 0) {
        this.roomInfo[roomId].host = this.roomInfo[roomId].users[0].name;
        this.server.to(roomId).emit('exit', this.roomInfo[roomId]);
      } else {
        delete this.roomInfo[roomId];
        await this.socketService.deleteRoom(roomId);
      }
    }
    delete this.user[client.id];
    this.server.emit('list', this.user);
  }

  // server에 접속해있는 모든 클라이언트에게 msg 보내기
  @SubscribeMessage('alarm')
  handleAlarm(@MessageBody() message: string) {
    this.server.emit('alarm', message);
  }

  // 방접속해있는 유저에게  List 전달
  @SubscribeMessage('roomList')
  async handleRoomList(@ConnectedSocket() client: Socket) {
    const roomList = await this.socketService.getRoomList();
    client.emit('roomList', roomList);
  }
  // 게임 방에서 대화
  @SubscribeMessage('chat')
  async handleMessage(
    @MessageBody() { roomId, chat }: Chat,
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(roomId).emit('chat', `${this.user[client.id].name}:${chat}`);
  }

  // 게임 방 생성
  @SubscribeMessage('createRoom')
  async handleCreate(
    @MessageBody() data: CreateRoomDto,
    @ConnectedSocket() client: any,
  ) {
    this.user[client.id] = client.request.user;
    const room = await this.socketService.createRoom(
      this.user[client.id].id,
      data,
    );
    this.roomInfo[room.id] = room;
    this.roomInfo[room.id].host = this.user[client.id].name;
    client.emit('createRoom', this.roomInfo[room.id]);
  }

  // 게임 방 입장
  @SubscribeMessage('enter')
  async handleEnter(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: any,
  ) {
    if (client.rooms.has(roomId)) {
      return;
    }
    if (!this.roomInfo[roomId]) return;
    this.user[client.id].roomId = roomId;
    this.roomInfo[roomId] = await this.socketService.enterRoom(
      this.user[client.id].id,
      roomId,
    );
    client.join(roomId);

    this.server.to(roomId).emit('enter', this.roomInfo[roomId]);
  }

  // 게임방 퇴장
  @SubscribeMessage('exit')
  async handleExit(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (!client.rooms.has(roomId)) {
      return;
    }
    await this.socketService.exitRoom(this.user[client.id].id);
    this.roomInfo[roomId] = await this.socketService.getRoom(roomId);
    client.leave(roomId);
    if (this.roomInfo[roomId].users.length > 0) {
      this.roomInfo[roomId].host = this.roomInfo[roomId].users[0].name;
      this.server.to(roomId).emit('exit', this.roomInfo[roomId]);
    } else {
      delete this.roomInfo[roomId];
      await this.socketService.deleteRoom(roomId);
    }
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
