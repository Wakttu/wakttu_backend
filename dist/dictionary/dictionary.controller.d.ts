import { BadRequestException } from '@nestjs/common';
import { DictionaryService } from './dictionary.service';
import { CreateDictionaryDto } from './dto/create-dictionary.dto';
import { UpdateDictionaryDto } from './dto/update-dictionary.dto';
export declare class DictionaryController {
    private readonly dictionaryService;
    constructor(dictionaryService: DictionaryService);
    create(createDictionaryDto: CreateDictionaryDto): Promise<{
        id: string;
        type: string | null;
        meta: import("@prisma/client/runtime/library").JsonValue | null;
        mean: string | null;
        hit: number;
        wakta: boolean;
    }>;
    search(query: any): Promise<{
        id: string;
        type: string | null;
        meta: import("@prisma/client/runtime/library").JsonValue | null;
        mean: string | null;
        hit: number;
        wakta: boolean;
    }[] | BadRequestException>;
    todayWord(): Promise<string>;
    findById(id: string): Promise<{
        id: string;
        type: string | null;
        meta: import("@prisma/client/runtime/library").JsonValue | null;
        mean: string | null;
        hit: number;
        wakta: boolean;
    }>;
    update(id: string, updateDictionaryDto: UpdateDictionaryDto): Promise<{
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
<<<<<<< HEAD
    checkManner(keyword: string): Promise<boolean>;
    findAll(id: string): Promise<{
        id: string;
        type: string | null;
        meta: import("@prisma/client/runtime/library").JsonValue | null;
        mean: string | null;
        hit: number;
        wakta: boolean;
    }[]>;
=======
>>>>>>> 4b3bc0d (feat: turn 개발)
}
