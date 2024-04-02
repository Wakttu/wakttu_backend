import { UserService } from 'src/user/user.service';
import { Request } from 'express';
import { WakgamesService } from 'src/wakgames/wakgames.service';
export declare class AuthService {
    private readonly userService;
    private readonly wakgamesService;
    constructor(userService: UserService, wakgamesService: WakgamesService);
    OAuthLogin(user: any): Promise<import("../user/entities/user.entity").User | {
        id: string;
        name: string;
        provider: string;
        score: number;
        password: string | null;
        keyboard: string[];
        character: import("@prisma/client/runtime/library").JsonValue;
        roomId: string | null;
    }>;
    LocalLogin(user: any): Promise<{
        id: string;
        name: string;
        provider: string;
        score: number;
        password: string | null;
        keyboard: string[];
        character: import("@prisma/client/runtime/library").JsonValue;
        roomId: string | null;
    }>;
    passworMatch(password: string, hash: string): Promise<boolean>;
    logout(request: Request): Promise<any>;
    signup({ id, name, password }: {
        id: any;
        name: any;
        password: any;
    }): Promise<{
        status: number;
        message: string;
    }>;
    checkId(id: string): Promise<{
        status: number;
        success: boolean;
        message: string;
    }>;
    checkName(name: string): Promise<{
        status: number;
        success: boolean;
        message: string;
    }>;
    waktaOauth(): Promise<object>;
    waktaLogin(auth: any): Promise<{
        accessToken: string;
        refreshToken: string;
        user: import("../user/entities/user.entity").User;
    } | {
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            name: string;
            provider: string;
            score: number;
            password: string | null;
            keyboard: string[];
            character: import("@prisma/client/runtime/library").JsonValue;
            roomId: string | null;
        };
    }>;
    waktaUpdateToken(token: any): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    discordUser(custom: any): Promise<import("../user/entities/user.entity").User | {
        id: string;
        name: string;
        provider: string;
        score: number;
        password: string | null;
        keyboard: string[];
        character: import("@prisma/client/runtime/library").JsonValue;
        roomId: string | null;
    }>;
    guestUser(): Promise<import("../user/entities/user.entity").User>;
}
