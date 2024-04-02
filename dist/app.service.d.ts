import { PrismaService } from './prisma/prisma.service';
import { UserService } from './user/user.service';
export declare class AppService {
    private readonly prisma;
    private readonly userService;
    constructor(prisma: PrismaService, userService: UserService);
    getHello(): string;
    getAchieve(): Promise<{
        id: string;
        name: string;
        type: string;
        hint: string;
        author: string;
        desc: string;
        hidden: boolean;
        statId: string | null;
    }[]>;
    findUser(user: any): Promise<boolean>;
}
