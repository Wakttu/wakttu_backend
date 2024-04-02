import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketService } from './socket.service';
import { SocketAuthenticatedGuard } from 'src/socket/socket-auth.guard';
import { CreateRoomDto } from 'src/room/dto/create-room.dto';
import { Room } from 'src/room/entities/room.entity';
import { KungService } from 'src/kung/kung.service';
import { LastService } from 'src/last/last.service';
import { UpdateRoomDto } from 'src/room/dto/update-room.dto';
import { BellService } from 'src/bell/bell.service';
import { ConfigService } from '@nestjs/config';
interface Chat {
    roomId: string;
    chat: string;
    roundTime: number | undefined;
    score: number | undefined;
    success?: boolean;
}
export declare class Game {
    constructor();
    host: string;
    type: number;
    round: number;
    turn: number;
    total: number;
    users: {
        id: string;
        score: number;
        userId: string;
        character: JSON;
        name: string;
        team?: string;
        success?: boolean;
        exp: number;
        provider?: string;
    }[];
    keyword: string | undefined;
    target: string;
    option: boolean[] | undefined;
    chain: number;
    roundTime: number;
    turnTime: number;
    mission: string | undefined;
    ban: string[];
    team: {
        woo: string[];
        gomem: string[];
        academy: string[];
        isedol: string[];
    };
    quiz?: {
        _id: string;
        type: string;
        [x: string]: any;
        choseong: string;
        hint: string[];
    }[];
    loading?: boolean;
    turnChanged: boolean;
}
export declare class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly lastService;
    private readonly kungService;
    private readonly bellService;
    private readonly socketService;
    private readonly guard;
    private readonly config;
    private readonly logger;
    private readonly MAX_CONNECTIONS;
    private currentConnections;
    constructor(lastService: LastService, kungService: KungService, bellService: BellService, socketService: SocketService, guard: SocketAuthenticatedGuard, config: ConfigService);
    server: Server;
    user: {
        [socketId: string]: any;
    };
    roomInfo: {
        [roomId: string]: Room;
    };
    game: {
        [roomId: string]: Game;
    };
    ping: {
        [roomId: string]: NodeJS.Timeout;
    };
    handleConnection(client: any): Promise<void>;
    afterInit(): Promise<void>;
    handleDisconnect(client: any): Promise<void>;
    handlePing(roomId: string): void;
    handlePong(roomId: any): void;
    handleUserList(client: Socket): void;
    handleAlarm(message: string): void;
    handleRoomList(client: Socket): Promise<void>;
    handleLobbyChat(chat: string, client: Socket): Promise<void>;
    handleMessage({ roomId, chat, roundTime, score, success }: Chat, client: Socket): Promise<boolean>;
    private handleGameMessage;
    handleCreate(data: CreateRoomDto, client: any): Promise<void>;
    handleUpdate({ roomId, data }: {
        roomId: string;
        data: UpdateRoomDto;
    }, client: any): Promise<void>;
    handleEnter({ roomId, password }: {
        roomId: string;
        password: string;
    }, client: any): Promise<void>;
    handleExit(roomId: string, client: Socket): Promise<void>;
    handleKick({ roomId, userId }: {
        roomId: string;
        userId: string;
    }, client: Socket): void;
    hanldeKickHelper(roomId: string, client: Socket): Promise<void>;
    handleChangeHost({ roomId, userId }: {
        roomId: string;
        userId: string;
    }, client: Socket): void;
    handleTeam({ roomId, team }: {
        roomId: string;
        team: string;
    }, client: Socket): void;
    handleExitTeam(roomId: string, client: Socket): void;
    handleReady(roomId: string, client: Socket): void;
    handleExitReady(roomId: string, client: Socket): void;
    handleHostReady({ roomId, id }: {
        roomId: string;
        id: string;
    }): void;
    handleStart(roomId: string): Promise<void>;
    handleInfo(client: Socket): Promise<void>;
    handleLastStart(roomId: string, client: Socket): Promise<void>;
    handleLastRound(roomId: string): Promise<void>;
    handleTurnStart(roomId: string): Promise<void>;
    handleTurnEnd(roomId: string): Promise<void>;
    handleLastAnswer({ roomId, chat, roundTime, score, success }: Chat): Promise<void>;
    handleKungStart(roomId: string, client: Socket): Promise<void>;
    handleKungRound(roomId: string): void;
    handleKungAnswer({ roomId, chat, roundTime, score, success }: Chat): Promise<void>;
    handleKTurnStart(roomId: string): Promise<void>;
    handleKTurnEnd(roomId: string): void;
    handleBellStart(roomId: string, client: Socket): Promise<void>;
    handleBellRound(roomId: string): Promise<void>;
    handleBellPing(roomId: string): void;
    handleBellPong(roomId: any): void;
    handleBellRoundStart(roomId: string): void;
    handleBellRoundEnd(roomId: string): void;
    handleBellAnswer({ roomId, score, }: {
        roomId: string;
        score: number;
    }, client: Socket): void;
}
export {};
