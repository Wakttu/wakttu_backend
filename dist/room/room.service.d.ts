import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Room } from './entities/room.entity';
export declare class RoomService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: CreateRoomDto): Promise<Room | null>;
    findByQuery(title?: string, start?: boolean, option?: string[], take?: number, skip?: number): Promise<Room[] | null>;
    findById(id: string): Promise<Room | null>;
    update(id: string, data: UpdateRoomDto): Promise<Room | null>;
    setStart(id: string, start: boolean): Promise<Room>;
    remove(id: string): Promise<any>;
    removeAll(): Promise<any>;
}
