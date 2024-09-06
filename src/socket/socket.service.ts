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

  /**
   *
   * @param word : 단어 찾는 string
   * @returns id,mean,type,meta,wakta
   */
  async findWord(word: string): Promise<Dictionary | null> {
    return await this.dicService.findById(word);
  }

  /**
   *
   * @param length 필요한단어길이
   * @returns word keyword 설정
   */
  async setWord(length: number): Promise<string> {
    return await this.dicService.getWord(length);
  }

  /**
   *
   * @param userId 방만들기할때 필요한 유저아이디
   * @param data 방만들기 정보
   * @returns room
   */
  async createRoom(userId: string, data: CreateRoomDto): Promise<CreateRoom> {
    const room = await this.roomService.create(data);
    return await this.userService.roomCreate(userId, room.id);
  }

  /**
   *
   * @param roomId
   * @param data
   * @returns
   */
  async updateRoom(roomId: string, data: UpdateRoomDto): Promise<Room> {
    return await this.roomService.update(roomId, data);
  }

  /**
   *
   * @param roomId roomId
   */
  async deleteRoom(roomId: string): Promise<void> {
    await this.roomService.remove(roomId);
  }

  /**
   * 모든방제거
   */
  async deleteAllRoom(): Promise<void> {
    await this.roomService.removeAll();
  }

  /**
   *
   * @param userId
   * @param roomId
   * @returns roomInfo
   */
  async enterRoom(userId: string, roomId: string): Promise<Room> {
    return await this.userService.enter(userId, roomId);
  }

  /**
   *
   * @param userId 방 나가기
   */
  async exitRoom(userId: string): Promise<void> {
    await this.userService.exit(userId);
  }

  /**
   *
   * @param userId
   * @returns 방나가기 강제
   */
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

  /**
   *
   * @returns roomList
   */
  async getRoomList(): Promise<Room[]> {
    return await this.roomService.findAll();
  }

  /**
   *
   * @param roomId
   * @returns roomInfo
   */
  async getRoom(roomId: string): Promise<Room> {
    return await this.roomService.findById(roomId);
  }

  /**
   * 게임 시작 정보변경
   * @param roomId
   * @param start
   * @returns roomInfo
   */
  async setStart(roomId: string, start: boolean): Promise<Room> {
    return await this.roomService.setStart(roomId, !start);
  }

  /**
   * 비밀번호체크
   * @param roomId
   * @param password
   * @returns
   */
  async checkPassword(
    roomId: string,
    password: string | undefined,
  ): Promise<boolean> {
    return await this.roomService.checkPassword(roomId, password);
  }

  /**
   * 유저순서 섞기
   * @param game
   */
  shuffle(game: Game) {
    const arr = game.users;
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    game.users = arr;
  }

  /**
   *
   * @returns 미션등록
   */
  async getMission(): Promise<string> {
    return await this.dicService.getMission();
  }

  /**
   * 한방단어금지
   * @param keyword
   * @returns
   */

  /**
   * 옵션 체크
   * @param keyword
   * @returns
   */
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

  /**
   * 옵션등록
   * @param option
   * @returns
   */
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

  /**
   * 옵션 체크
   * @param option
   * @param keyword
   * @param type
   * @returns
   */
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

  /**
   * 옵션 통과체크
   * @param _word
   * @param option
   * @returns
   */
  async check(_word: string, option: boolean[]) {
    const word = await this.findWord(_word);
    if (!word) return { success: false, message: '없는 단어입니다.' };
    const { success, message } = await this.checkOption(
      option,
      word.id.slice(-1),
      word.type,
    );
    return { success, message, word };
  }

  async getQuizList(take: number): Promise<Quiz[]> {
    return await this.quizService.getList(take);
  }

  /**
   *
   * @returns 유저의 색깔 hex code
   */
  getColor() {
    let randomHex = Math.floor(Math.random() * 0xffffff).toString(16);
    randomHex = `#${randomHex.padStart(6, '0')}`;
    return randomHex;
  }

  getTurnTime(roundTime: number) {
    let duration = 0;
    if (71000 <= roundTime && roundTime <= 120000) {
      duration = 20000;
    } else if (61000 <= roundTime && roundTime < 71000) {
      duration = 18000;
    } else if (51000 <= roundTime && roundTime < 61000) {
      duration = 16000;
    } else if (41000 <= roundTime && roundTime < 51000) {
      duration = 14000;
    } else if (31000 <= roundTime && roundTime < 41000) {
      duration = 12000;
    } else if (21000 <= roundTime && roundTime < 31000) {
      duration = 10000;
    } else if (11000 <= roundTime && roundTime < 21000) {
      duration = 8000;
    } else if (5100 <= roundTime && roundTime < 11000) {
      duration = 5100;
    } else if (1 <= roundTime && roundTime < 5100) {
      duration = Math.min(1500, roundTime);
    } else {
      duration = 0;
    }
    return duration;
  }

  /**
   * @Param users : {
    id: string;
    score: number;
    userId: string;
    character: JSON;
    name: string;
  }[]
   */
  async setResult(
    users: {
      id: string;
      score: number;
      userId: string;
      character: JSON;
      name: string;
    }[],
  ) {
    await this.userService.updateResult(users);
  }
}
