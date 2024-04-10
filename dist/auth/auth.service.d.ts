import { UserService } from 'src/user/user.service';
export declare class AuthService {
    private readonly userService;
    constructor(userService: UserService);
    OAuthLogin(user: any): Promise<import("src/user/entities/user.entity").User | {
        name: string;
        id: string;
        score: number;
        roomId: string;
    }>;
}
