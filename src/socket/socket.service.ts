import { Injectable } from '@nestjs/common';
import { DictionaryService } from 'src/dictionary/dictionary.service';
import { Dictionary } from 'src/dictionary/entities/dictionary.entity';
import { RoomService } from 'src/room/room.service';
import { Room } from 'src/room/entities/room.entity';

@Injectable()
export class SocketService {
  constructor(
    private readonly dic: DictionaryService,
    private readonly room: RoomService,
  ) {}

  async findWord(word: string): Promise<Dictionary | null> {
    return await this.dic.findById(word);
  }

  async getWord(length: number): Promise<string> {
    return await this.dic.getWord(length);
  }

  async createRoom(data: any): Promise<Room> {
    return await this.room.create(data);
  }
}
