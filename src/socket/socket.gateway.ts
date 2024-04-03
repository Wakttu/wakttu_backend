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

interface Data {
  roomId: string | string[];
  message: string;
}

@WebSocketGateway({ namespace: 'wakttu' })
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  public server: Server;

  public clients: {
    [socketId: string]: string;
  } = {};

  handleConnection(client: Socket): void {
    this.clients[client.id] = client.id;
    console.log(this.clients);
  }

  afterInit() {
    console.log('socket is open!');
  }

  handleDisconnect(client: Socket): void {
    delete this.clients[client.id];
  }

  @SubscribeMessage('chat')
  handleMessage(@MessageBody() { roomId, message }: Data): void {
    this.server.to(roomId).emit('chat', message);
  }

  @SubscribeMessage('enter')
  handleEnter(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(roomId);
    this.server.to(roomId).emit('enter', `${client.id}이 입장`);
  }

  @SubscribeMessage('exit')
  handleExit(@MessageBody() roomId: string, @ConnectedSocket() client: Socket) {
    client.leave(roomId);
    this.server.to(roomId).emit('exit', `${client.id}이 퇴장`);
  }

  @SubscribeMessage('status')
  handleStatus(@ConnectedSocket() client: Socket) {
    console.log(client.rooms);
  }
}
