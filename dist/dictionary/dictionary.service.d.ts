import { CreateDictionaryDto } from './dto/create-dictionary.dto';
import { UpdateDictionaryDto } from './dto/update-dictionary.dto';
import { PrismaService } from 'src/prisma/prisma.service';
export declare class DictionaryService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: CreateDictionaryDto): Promise<{
        id: string;
        type: string | null;
        meta: import("@prisma/client/runtime/library").JsonValue | null;
        mean: string | null;
        hit: number;
        wakta: boolean;
    }>;
    findById(id: string): Promise<{
        id: string;
        type: string | null;
        meta: import("@prisma/client/runtime/library").JsonValue | null;
        mean: string | null;
        hit: number;
        wakta: boolean;
    }>;
    findAll(id: string): Promise<{
        id: string;
        type: string | null;
        meta: import("@prisma/client/runtime/library").JsonValue | null;
        mean: string | null;
        hit: number;
        wakta: boolean;
    }[]>;
    update(id: string, data: UpdateDictionaryDto): Promise<{
        id: string;
        type: string | null;
        meta: import("@prisma/client/runtime/library").JsonValue | null;
        mean: string | null;
        hit: number;
        wakta: boolean;
    }>;
    remove(id: string): Promise<{
        id: string;
        type: string | null;
        meta: import("@prisma/client/runtime/library").JsonValue | null;
        mean: string | null;
        hit: number;
        wakta: boolean;
    }>;
    getWord(length: number): Promise<string>;
    checkManner(keyword: string): Promise<boolean>;
    getMission(): Promise<string>;
    search(keyword: string, take?: number, skip?: number): Promise<{
        id: string;
        type: string | null;
        meta: import("@prisma/client/runtime/library").JsonValue | null;
        mean: string | null;
        hit: number;
        wakta: boolean;
    }[]>;
    todayWord(): Promise<string>;
    getQuiz(round: number): Promise<[]>;
}
