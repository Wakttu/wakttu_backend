import { Injectable } from '@nestjs/common';
import { DictionaryService } from 'src/dictionary/dictionary.service';
import { Dictionary } from 'src/dictionary/entities/dictionary.entity';
import { RoomService } from 'src/room/room.service';
import { Room } from 'src/room/entities/room.entity';
import { UserService } from 'src/user/user.service';
import { CreateRoomDto } from 'src/room/dto/create-room.dto';
@Injectable()
export class SocketService {
  constructor(
    private readonly dicService: DictionaryService,
    private readonly roomService: RoomService,
    private readonly userService: UserService,
  ) {}

  async findWord(word: string): Promise<Dictionary | null> {
    return await this.dicService.findById(word);
  }

  async setWord(length: number): Promise<string> {
    return await this.dicService.getWord(length);
  }

  async createRoom(userId: string, data: CreateRoomDto): Promise<Room> {
    const room = await this.roomService.create(data);
    return await this.userService.enter(userId, room.id);
  }

  async deleteRoom(roomId: string): Promise<void> {
    await this.roomService.remove(roomId);
  }

  async deleteAllRoom(): Promise<void> {
    await this.roomService.removeAll();
  }

  async enterRoom(userId: string, roomId: string): Promise<Room> {
    return await this.userService.enter(userId, roomId);
  }

  async exitRoom(userId: string): Promise<void> {
    await this.userService.exit(userId);
  }

  async strongExitRoom(userId: string) {
    const response = await this.userService.findById(userId);
    const roomId = response.roomId;
    const room = await this.roomService.findById(roomId);
    if (room.users.length > 1) {
      return await this.userService.exit(userId);
    } else {
      return await this.roomService.remove(roomId);
    }
  }
  async getRoomList(
    title: string = undefined,
    start: boolean = false,
    option: string[] = undefined,
    take: number = 6,
    skip: number = 0,
  ): Promise<Room[]> {
    return await this.roomService.findByQuery(title, start, option, take, skip);
  }

  async getRoom(roomId: string): Promise<Room> {
    return await this.roomService.findById(roomId);
  }
}
