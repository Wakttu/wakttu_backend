import { CreateDictionaryDto } from './dto/create-dictionary.dto';
import { UpdateDictionaryDto } from './dto/update-dictionary.dto';
import { PrismaService } from 'src/prisma/prisma.service';
export declare class DictionaryService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: CreateDictionaryDto): Promise<{
        id: string;
        type: string;
        mean: string;
        hit: number;
        flag: number;
        theme: string;
    }>;
    findById(id: string): Promise<{
        id: string;
        type: string;
        mean: string;
        hit: number;
        flag: number;
        theme: string;
    }>;
    update(id: string, data: UpdateDictionaryDto): Promise<{
        id: string;
        type: string;
        mean: string;
        hit: number;
        flag: number;
        theme: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        type: string;
        mean: string;
        hit: number;
        flag: number;
        theme: string;
    }>;
    getWord(length: number): Promise<string>;
}
