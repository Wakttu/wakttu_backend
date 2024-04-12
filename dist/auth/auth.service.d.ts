import { UserService } from 'src/user/user.service';
import { Request } from 'express';
export declare class AuthService {
    private readonly userService;
    constructor(userService: UserService);
    OAuthLogin(user: any): Promise<{
        id: string;
        name: string;
        score: number;
        password: string;
        roomId: string;
    } | import("src/user/entities/user.entity").User>;
    LocalLogin(user: any): Promise<{
        id: string;
        name: string;
        score: number;
        password: string;
        roomId: string;
    }>;
    passworMatch(password: string, hash: string): Promise<boolean>;
    login(): Promise<any>;
    logout(request: Request): Promise<any>;
    signup({ id, name, password }: {
        id: any;
        name: any;
        password: any;
    }): Promise<"이미 존재하는 email 입니다." | "회원가입 실패" | "회원가입 성공">;
}
