import { PassportSerializer } from '@nestjs/passport';
import { User } from './user/entities/user.entity';
import { UserService } from './user/user.service';
export declare class SessionSerializer extends PassportSerializer {
    private readonly userService;
    constructor(userService: UserService);
    serializeUser(user: User, done: (err: any, user?: any) => void): Promise<any>;
    deserializeUser(payload: any, done: (err: any, user?: any) => void): Promise<any>;
}
