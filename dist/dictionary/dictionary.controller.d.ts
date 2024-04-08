import { DictionaryService } from './dictionary.service';
import { CreateDictionaryDto } from './dto/create-dictionary.dto';
import { UpdateDictionaryDto } from './dto/update-dictionary.dto';
export declare class DictionaryController {
    private readonly dictionaryService;
    constructor(dictionaryService: DictionaryService);
    create(createDictionaryDto: CreateDictionaryDto): Promise<{
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
    update(id: string, updateDictionaryDto: UpdateDictionaryDto): Promise<{
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
}
