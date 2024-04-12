import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    naverLogin(): Promise<void>;
    naverLoginCallback(req: any, res: any): Promise<void>;
    logout(request: Request): Promise<any>;
    login(res: Response): Promise<any>;
    localLogin(req: Request): Promise<any>;
    signup(user: CreateUserDto): Promise<any>;
    user(req: any): Promise<{
        data: any;
        msg: string;
    } | {
        msg: string;
        data?: undefined;
    }>;
}
