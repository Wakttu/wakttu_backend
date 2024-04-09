import { Injectable } from '@nestjs/common';
import { DictionaryService } from 'src/dictionary/dictionary.service';
import { Dictionary } from 'src/dictionary/entities/dictionary.entity';
import { RoomService } from 'src/room/room.service';
import { Room } from 'src/room/entities/room.entity';
import { UserService } from 'src/user/user.service';
import { CreateRoomDto } from 'src/room/dto/create-room.dto';
import { Req } from '@nestjs/common';
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

  async getWord(length: number): Promise<string> {
    return await this.dicService.getWord(length);
  }

  async createRoom(
    roomId: string,
    data: CreateRoomDto,
    user: any,
  ): Promise<Room> {
    await this.roomService.create(data);
    return await this.userService.enter(user.id, roomId);
  }
  async test(@Req() req: Request) {
    return req;
  }
}
