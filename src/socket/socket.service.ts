import { Injectable } from '@nestjs/common';
import { DictionaryService } from 'src/dictionary/dictionary.service';
import { Dictionary } from 'src/dictionary/entities/dictionary.entity';
import { RoomService } from 'src/room/room.service';
import { CreateRoom, Room } from 'src/room/entities/room.entity';
import { UserService } from 'src/user/user.service';
import { CreateRoomDto } from 'src/room/dto/create-room.dto';
import { Game } from './socket.gateway';
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

  async createRoom(userId: string, data: CreateRoomDto): Promise<CreateRoom> {
    const room = await this.roomService.create(data);
    return await this.userService.roomCreate(userId, room.id);
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
    option: string[] = [],
    take: number = 6,
    skip: number = 0,
  ): Promise<Room[]> {
    return await this.roomService.findByQuery(title, start, option, take, skip);
  }

  async getRoom(roomId: string): Promise<Room> {
    return await this.roomService.findById(roomId);
  }
  async setStart(roomId: string, start: boolean): Promise<Room> {
    return await this.roomService.setStart(roomId, !start);
  }

  async checkPassword(
    roomId: string,
    password: string | undefined,
  ): Promise<boolean> {
    return await this.roomService.checkPassword(roomId, password);
  }

  shuffle(game: Game) {
    const arr = game.users;
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    game.users = arr;
  }

  async checkManner(keyword: string): Promise<boolean> {
    const flag = await this.dicService.checkManner(keyword);
    if (flag) return true;
    return false;
  }

  checkWakta(type: string): boolean {
    if (type === 'WAKTA') return true;
    return false;
  }

  checkInjeong(type: string): boolean {
    if (type === 'INJEONG') return true;
    return false;
  }

  getOption(option: string[]): boolean[] {
    const flag: boolean[] = [false, false, false];
    if (option.includes('매너')) {
      flag[0] = true;
    }
    if (option.includes('품어')) {
      flag[1] = true;
    }
    if (option.includes('외수')) {
      flag[2] = true;
    }
    return flag;
  }

  async checkOption(
    option: boolean[],
    keyword: string,
    type: string,
  ): Promise<any> {
    if (option[0]) {
      const flag0 = await this.checkManner(keyword);
      if (!flag0) return { success: false, message: '한방 단어 금지!' };
    }

    if (!option[1]) {
      const flag1 = this.checkWakta(type);
      if (flag1) return { success: false, message: '품어 단어 금지!' };
    }

    if (!option[2]) {
      const flag2 = this.checkInjeong(type);
      if (flag2) return { success: false, message: '외수 단어 금지!' };
    }
    return { success: true, message: '성공' };
  }
}
