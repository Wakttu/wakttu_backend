import { DictionaryService } from 'src/dictionary/dictionary.service';
import { Dictionary } from 'src/dictionary/entities/dictionary.entity';
import { RoomService } from 'src/room/room.service';
import { CreateRoom, Room } from 'src/room/entities/room.entity';
import { UserService } from 'src/user/user.service';
import { CreateRoomDto } from 'src/room/dto/create-room.dto';
import { Game } from './socket.gateway';
import { UpdateRoomDto } from 'src/room/dto/update-room.dto';
export declare class SocketService {
  private readonly dicService;
  private readonly roomService;
  private readonly userService;
  constructor(
    dicService: DictionaryService,
    roomService: RoomService,
    userService: UserService,
  );
  reloadUser(id: string): Promise<{
    id: string;
    name: string;
    provider: string;
    score: number;
    keyboard: string[];
    character: import('@prisma/client/runtime/library').JsonValue;
    roomId: string | null;
  }>;
  findWord(word: string): Promise<Dictionary | null>;
  setWord(length: number): Promise<string>;
  getQuiz(round: number): Promise<[]>;
  createRoom(userId: string, data: CreateRoomDto): Promise<CreateRoom>;
  updateRoom(roomId: string, data: UpdateRoomDto): Promise<Room>;
  deleteRoom(roomId: string): Promise<void>;
  deleteAllRoom(): Promise<void>;
  enterRoom(userId: string, roomId: string): Promise<Room>;
  exitRoom(userId: string): Promise<void>;
  strongExitRoom(userId: string): Promise<any>;
  getRoomList(): Promise<Room[]>;
  getRoom(roomId: string): Promise<Room>;
  setStart(roomId: string, start: boolean): Promise<Room>;
  checkPassword(roomId: string, password: string | undefined): Promise<boolean>;
  shuffle(game: Game): void;
  teamShuffle(
    game: Game,
    team: {
      woo: string[];
      gomem: string[];
      academy: string[];
      isedol: string[];
    },
  ): void;
  getMission(): Promise<string>;
  checkManner(keyword: string): Promise<boolean>;
  checkWakta(wakta: boolean): boolean;
  checkPoom(type: string): boolean;
  checkInjeong(type: string): boolean;
  getOption(option: string[]): boolean[];
  checkOption(option: boolean[], keyword: string, type: string): Promise<any>;
  check(
    _word: string,
    option: boolean[],
  ): Promise<
    | {
        success: boolean;
        message: string;
        word?: undefined;
      }
    | {
        success: any;
        message: any;
        word: Dictionary;
      }
  >;
  getColor(): string;
  getTurnTime(roundTime: number, chain?: number): number;
  setResult(
    users: {
      id: string;
      score: number;
      userId: string;
      character: JSON;
      name: string;
    }[],
  ): Promise<{}>;
  deleteGuest(id: string): Promise<void>;
  getFail(target: string): Promise<string>;
}
