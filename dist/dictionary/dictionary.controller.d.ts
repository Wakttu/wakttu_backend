import { DictionaryService } from './dictionary.service';
import { CreateDictionaryDto } from './dto/create-dictionary.dto';
import { UpdateDictionaryDto } from './dto/update-dictionary.dto';
import { SocketGateway } from 'src/socket/socket.gateway';
export declare class DictionaryController {
    private readonly dictionaryService;
    private readonly socketGateway;
    constructor(dictionaryService: DictionaryService, socketGateway: SocketGateway);
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
    check(id: string, req: any): Promise<{
        id: string;
        type: string;
        mean: string;
        hit: number;
        flag: number;
        theme: string;
    }>;
}
