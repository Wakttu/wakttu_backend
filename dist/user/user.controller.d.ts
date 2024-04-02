import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getUser(id: string): Promise<{
        id: string;
        name: string;
        provider: string;
        score: number;
        password: string | null;
        keyboard: string[];
        character: import("@prisma/client/runtime/library").JsonValue;
        roomId: string | null;
    }>;
    signUp(createUserDto: CreateUserDto): Promise<import("./entities/user.entity").User>;
    updateUser(id: string, body: UpdateUserDto, session: any): Promise<import("./entities/user.entity").User>;
    updateScore(id: string, score: number): Promise<{
        score: number;
    }>;
    getItems(id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        category: string;
        hint: string | null;
        author: string;
        url: string;
        achieveId: string[];
    }[]>;
    achieveItem(session: Record<string, any>, itemId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    achieveAllItems(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
