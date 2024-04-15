import { DictionaryService } from 'src/dictionary/dictionary.service';
import { Dictionary } from 'src/dictionary/entities/dictionary.entity';
import { RoomService } from 'src/room/room.service';
import { Room } from 'src/room/entities/room.entity';
import { UserService } from 'src/user/user.service';
import { CreateRoomDto } from 'src/room/dto/create-room.dto';
export declare class SocketService {
    private readonly dicService;
    private readonly roomService;
    private readonly userService;
    constructor(dicService: DictionaryService, roomService: RoomService, userService: UserService);
    findWord(word: string): Promise<Dictionary | null>;
    setWord(length: number): Promise<string>;
    createRoom(userId: string, data: CreateRoomDto): Promise<Room>;
    deleteRoom(roomId: string): Promise<void>;
    deleteAllRoom(): Promise<void>;
    enterRoom(userId: string, roomId: string): Promise<Room>;
    exitRoom(userId: string): Promise<void>;
    strongExitRoom(userId: string): Promise<any>;
    getRoomList(title?: string, start?: boolean, option?: string[], take?: number, skip?: number): Promise<Room[]>;
    getRoom(roomId: string): Promise<Room>;
}
