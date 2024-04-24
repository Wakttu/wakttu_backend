import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
export declare class RoomController {
    private readonly roomService;
    constructor(roomService: RoomService);
    create(createRoomDto: CreateRoomDto): Promise<import("src/room/entities/room.entity").CreateRoom>;
    findById(id: string): Promise<import("src/room/entities/room.entity").Room>;
    update(id: string, updateRoomDto: UpdateRoomDto): Promise<import("src/room/entities/room.entity").Room>;
    remove(id: string): Promise<any>;
    findByQuery(query: any): Promise<import("src/room/entities/room.entity").Room[]>;
}
