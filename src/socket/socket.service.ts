import { Injectable } from '@nestjs/common';
import { DictionaryService } from 'src/dictionary/dictionary.service';
import { Dictionary } from 'src/dictionary/entities/dictionary.entity';
import { RoomService } from 'src/room/room.service';
import { CreateRoom, Room } from 'src/room/entities/room.entity';
import { UserService } from 'src/user/user.service';
import { CreateRoomDto } from 'src/room/dto/create-room.dto';
import { Game } from './socket.gateway';
import { UpdateRoomDto } from 'src/room/dto/update-room.dto';

@Injectable()
export class SocketService {
  constructor(
    private readonly dicService: DictionaryService,
    private readonly roomService: RoomService,
    private readonly userService: UserService,
  ) {}

  async reloadUser(id: string) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...res } = await this.userService.findById(id);
    return res;
  }
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
   * @param round 필요한 단어수에 대한 총 라운드
   * @returns 단어와 관련된 정보 array
   */
  async getQuiz(round: number): Promise<[]> {
    return await this.dicService.getQuiz(round);
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
   * 팀별 순서 섞기
   */
  teamShuffle(
    game: Game,
    team: {
      woo: string[];
      gomem: string[];
      academy: string[];
      isedol: string[];
    },
  ) {
    const { woo, gomem, academy, isedol } = team;

    for (let i = woo.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [woo[i], woo[j]] = [woo[j], woo[i]];
    }

    for (let i = gomem.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gomem[i], gomem[j]] = [gomem[j], gomem[i]];
    }

    for (let i = academy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [academy[i], academy[j]] = [academy[j], academy[i]];
    }

    for (let i = isedol.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [isedol[i], isedol[j]] = [isedol[j], isedol[i]];
    }

    const keys = [woo, gomem, academy, isedol];
    for (let i = 3; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [keys[i], keys[j]] = [keys[j], keys[i]];
    }

    const count = Math.max(
      woo.length,
      gomem.length,
      academy.length,
      isedol.length,
    );
    const arr = [];
    for (let i = 0; i < count; i++) {
      for (let j = 0; j < 4; j++) {
        if (keys[j].length > 0) {
          const idx = game.users.findIndex(
            (user) => user.userId === keys[j][i],
          );
          arr.push(game.users[idx]);
        }
      }
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
    const flag: boolean[] = [false, false, false, false];
    if (option.includes('매너')) {
      flag[0] = true;
    }
    if (option.includes('외수')) {
      flag[1] = true;
    }
    if (option.includes('팀전')) {
      flag[2] = true;
    }
    if (option.includes('품어')) {
      flag[3] = true;
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
      if (!flag0) return { success: false, message: '2' };
    }

    if (!option[3]) {
      const flag1 = this.checkPoom(type);
      if (flag1) return { success: false, message: '4' };
    }

    if (!option[1]) {
      const flag2 = this.checkInjeong(type);
      if (flag2) return { success: false, message: '3' };
    }
    return { success: true, message: '0' };
  }

  /**
   * 옵션 통과체크
   * @param _word
   * @param option
   * @returns
   */
  async check(_word: string, option: boolean[]) {
    const word = await this.findWord(_word);
    if (!word) return { success: false, message: '1' };
    const { success, message } = await this.checkOption(
      option,
      word.id.slice(-1),
      word.type,
    );
    return { success, message, word };
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

  getTurnTime(roundTime: number, chain: number = 1) {
    if (chain >= 20 && chain < 30) {
      return Math.min(roundTime, 3000);
    } else if (chain >= 30 && chain < 40) {
      return Math.min(roundTime, 1000);
    } else if (chain >= 40) {
      return Math.min(roundTime, 700);
    } else {
      const speed = chain <= 10 ? chain : 10;
      return Math.min(roundTime, 20000 - 1500 * (speed - 1));
    }
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
    return await this.userService.updateResult(users);
  }
}
