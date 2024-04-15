import { UserService } from 'src/user/user.service';
import { Request } from 'express';
export declare class AuthService {
    private readonly userService;
    constructor(userService: UserService);
    OAuthLogin(user: any): Promise<import("src/user/entities/user.entity").User | {
        name: string;
        id: string;
        password: string;
        score: number;
        roomId: string;
    }>;
    LocalLogin(user: any): Promise<{
        name: string;
        id: string;
        password: string;
        score: number;
        roomId: string;
    }>;
    passworMatch(password: string, hash: string): Promise<boolean>;
    login(): Promise<any>;
    logout(request: Request): Promise<any>;
    signup({ id, name, password }: {
        id: any;
        name: any;
        password: any;
    }): Promise<{
        status: number;
        message: string;
    }>;
}
