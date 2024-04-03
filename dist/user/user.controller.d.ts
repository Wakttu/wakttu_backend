import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getUser(id: string): Promise<{
        id: string;
        name: string;
        image: string;
        score: number;
        provider: string;
        password: string;
    }>;
    signUp(createUserDto: CreateUserDto): Promise<import("src/user/entities/user.entity").User>;
}
