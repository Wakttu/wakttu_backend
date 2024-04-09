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
    getWord(length: number): Promise<string>;
    createRoom(roomId: string, data: CreateRoomDto, user: any): Promise<Room>;
    test(req: Request): Promise<Request>;
}
