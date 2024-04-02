import { ItemService } from './item.service';
export declare class ItemController {
    private readonly itemService;
    constructor(itemService: ItemService);
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
