import { AuthService } from './auth.service';
import { Request } from 'express';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    naverLogin(): Promise<void>;
    naverLoginCallback(req: any, res: any): Promise<void>;
    logout(request: Request): Promise<any>;
    login(): Promise<any>;
    signup(user: CreateUserDto): Promise<any>;
    user(req: any): Promise<{
        msg: string;
    }>;
}
