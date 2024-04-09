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
        image: string;
        score: number;
    }>;
    enter(id: string, roomId: string): Promise<{
        id: string;
        title: string;
        password: string;
        type: number;
        round: number;
        option: string[];
        count: number;
        start: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    exit(id: string, roomId: string): Promise<{
        id: string;
        title: string;
        password: string;
        type: number;
        round: number;
        option: string[];
        count: number;
        start: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
