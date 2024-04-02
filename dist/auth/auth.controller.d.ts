import { AuthService } from './auth.service';
import { Request } from 'express';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import { ConfigService } from '@nestjs/config';
export declare class AuthController {
    private authService;
    private configService;
    constructor(authService: AuthService, configService: ConfigService);
    logout(request: Request): Promise<any>;
    localLogin(body: LoginUserDto, session: any): Promise<any>;
    signup(user: CreateUserDto): Promise<any>;
    user(session: any): Promise<any>;
    checkId(id: string): Promise<any>;
    checkName(name: string): Promise<any>;
    waktaOauth(session: Record<string, any>): Promise<object>;
    waktaCallback(query: any, req: any, res: any): Promise<any>;
    waktaRefresh(req: Request): Promise<{
        status: number;
        accessToken: string;
        refreshToken: string;
    }>;
    discordAuh(req: Request, session: any): Promise<import("../user/entities/user.entity").User | {
        id: string;
        name: string;
        provider: string;
        score: number;
        password: string | null;
        keyboard: string[];
        character: import("@prisma/client/runtime/library").JsonValue;
        roomId: string | null;
    }>;
    guest(session: any): Promise<{
        status: number;
    }>;
}
