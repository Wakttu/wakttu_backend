export declare class Room {
    id: string;
    title: string;
    type: number;
    option: string[];
    round: number;
    total: number;
    start: boolean;
    users: any;
    createdAt: Date;
    updatedAt: Date;
    time: number;
}
export declare class CreateRoom extends Room {
    password: string | undefined;
}
