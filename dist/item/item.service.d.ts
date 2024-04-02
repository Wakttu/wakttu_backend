import { PrismaService } from 'src/prisma/prisma.service';
export declare class ItemService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        name: string;
        description: string | null;
        category: string;
        hint: string | null;
        author: string;
        url: string;
        achieveId: string[];
    }[]>;
}
