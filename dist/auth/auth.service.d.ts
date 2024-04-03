import { UserService } from 'src/user/user.service';
export declare class AuthService {
    private readonly userService;
    constructor(userService: UserService);
    OAuthLogin(user: any): Promise<import("src/user/entities/user.entity").User | {
        id: string;
        name: string;
        image: string;
        score: number;
    }>;
}
