import { User } from './entities/user.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UserService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: CreateUserDto): Promise<User>;
    findById(id: string): Promise<{
        name: string;
        id: string;
        password: string;
        score: number;
        roomId: string;
    }>;
    enter(id: string, roomId: string): Promise<{
        users: {
            name: string;
            id: string;
        }[];
    } & {
        id: string;
        title: string;
        password: string;
        type: number;
        round: number;
        option: string[];
        total: number;
        start: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    exit(id: string): Promise<{
        id: string;
        title: string;
        password: string;
        type: number;
        round: number;
        option: string[];
        total: number;
        start: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
