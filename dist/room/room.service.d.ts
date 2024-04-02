import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRoom, Room } from './entities/room.entity';
export declare class RoomService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    idx: any;
    create(data: CreateRoomDto): Promise<CreateRoom>;
    findByQuery(title?: string, start?: boolean, option?: string[], take?: number, skip?: number): Promise<Room[] | null>;
    findAll(): Promise<Room[] | null>;
    findById(id: string): Promise<Room>;
    update(id: string, data: UpdateRoomDto): Promise<Room>;
    setStart(id: string, start: boolean): Promise<Room>;
    remove(id: string): Promise<any>;
    removeAll(): Promise<any>;
    checkPassword(roomId: string, password: string | undefined): Promise<boolean>;
}
