import { DictionaryService } from 'src/dictionary/dictionary.service';
import { Dictionary } from 'src/dictionary/entities/dictionary.entity';
import { RoomService } from 'src/room/room.service';
export declare class SocketService {
    private readonly dic;
    private readonly room;
    constructor(dic: DictionaryService, room: RoomService);
    findWord(word: string): Promise<Dictionary | null>;
}
