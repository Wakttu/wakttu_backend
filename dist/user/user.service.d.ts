import { User } from './entities/user.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UserService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: CreateUserDto): Promise<User>;
    findById(id: string): Promise<{
        id: string;
        name: string;
        image: string;
        score: number;
        provider: string;
        password: string;
    }>;
}
