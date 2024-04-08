import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    naverLogin(): Promise<void>;
    naverLoginCallback(req: any, res: any): Promise<void>;
    user(req: any): Promise<{
        msg: string;
    }>;
}
