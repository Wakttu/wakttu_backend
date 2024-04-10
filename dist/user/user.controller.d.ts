import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getUser(id: string): Promise<{
        name: string;
        id: string;
        score: number;
        roomId: string;
    }>;
    signUp(createUserDto: CreateUserDto): Promise<import("src/user/entities/user.entity").User>;
}
