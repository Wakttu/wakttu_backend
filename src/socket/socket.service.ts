import { Injectable } from '@nestjs/common';
import { DictionaryService } from 'src/dictionary/dictionary.service';
import { Dictionary } from 'src/dictionary/entities/dictionary.entity';
import { RoomService } from 'src/room/room.service';
import { CreateRoom, Room } from 'src/room/entities/room.entity';
import { UserService } from 'src/user/user.service';
import { CreateRoomDto } from 'src/room/dto/create-room.dto';
import { Game } from './socket.gateway';
import { QuizService } from 'src/quiz/quiz.service';
import { Quiz } from 'src/quiz/entities/quiz.entity';
import { UpdateRoomDto } from 'src/room/dto/update-room.dto';
@Injectable()
export class SocketService {
  constructor(
    private readonly dicService: DictionaryService,
    private readonly roomService: RoomService,
    private readonly userService: UserService,
    private readonly quizService: QuizService,
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

  async updateRoom(roomId: string, data: UpdateRoomDto): Promise<Room> {
    return await this.roomService.update(roomId, data);
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
  async getRoomList(): Promise<Room[]> {
    return await this.roomService.findAll();
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

  async getMission(): Promise<string> {
    return await this.dicService.getMission();
  }

  async checkManner(keyword: string): Promise<boolean> {
    const flag = await this.dicService.checkManner(keyword);
    if (flag) return true;
    return false;
  }

  checkWakta(wakta: boolean): boolean {
    return wakta === true;
  }
  checkPoom(type: string): boolean {
    return type === 'POOM';
  }
  checkInjeong(type: string): boolean {
    return type === 'INJEONG';
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
      const flag1 = this.checkPoom(type);
      if (flag1) return { success: false, message: '품어 단어 금지!' };
    }

    if (!option[2]) {
      const flag2 = this.checkInjeong(type);
      if (flag2) return { success: false, message: '외수 단어 금지!' };
    }
    return { success: true, message: '성공' };
  }

  async check(_word: string, option: boolean[]) {
    const word = await this.findWord(_word);
    if (!word) return { success: false, message: '없는 단어입니다.' };
    return await this.checkOption(option, word.id.slice(-1), word.type);
  }

  async getQuizList(take: number): Promise<Quiz[]> {
    return await this.quizService.getList(take);
  }
}
