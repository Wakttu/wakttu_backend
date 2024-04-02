"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SocketAuthenticatedGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketAuthenticatedGuard = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SocketAuthenticatedGuard = SocketAuthenticatedGuard_1 = class SocketAuthenticatedGuard {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(SocketAuthenticatedGuard_1.name);
    }
    async validateClient(client) {
        try {
            const session = client.request?.session;
            if (!session) {
                this.logger.warn('Socket connection rejected: No session found');
                return false;
            }
            if (!session.user?.id) {
                this.logger.warn('Socket connection rejected: Invalid user data');
                return false;
            }
            const ip = this.getRealClientIp(client);
            this.logger.log(`Client attempting connection: UserID=${session.user.id}, IP=${ip}`);
            const isAllowed = await this.checkBan(session.user.id, ip);
            if (!isAllowed) {
                this.logger.warn(`Socket connection rejected: User ${session.user.id} (IP: ${ip}) is banned.`);
                return false;
            }
            return true;
        }
        catch (error) {
            this.logger.error('Socket authentication error', error.stack);
            return false;
        }
    }
    async checkBan(userId, ip) {
        const res = await this.prisma.ban.findFirst({
            where: {
                OR: [{ userId }, { ip }],
            },
        });
        if (res) {
            this.logger.log(`Ban record found for UserID=${userId}, IP=${ip}`);
            return false;
        }
        this.logger.log(`No ban record for UserID=${userId}, IP=${ip}`);
        return true;
    }
    getRealClientIp(client) {
        const headers = client.handshake.headers;
        let ip = client.handshake.address;
        if (headers['cf-connecting-ip']) {
            ip = headers['cf-connecting-ip'];
        }
        else if (headers['x-forwarded-for']) {
            ip = headers['x-forwarded-for'].split(',')[0].trim();
        }
        return ip;
    }
};
exports.SocketAuthenticatedGuard = SocketAuthenticatedGuard;
exports.SocketAuthenticatedGuard = SocketAuthenticatedGuard = SocketAuthenticatedGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SocketAuthenticatedGuard);
//# sourceMappingURL=socket-auth.guard.js.map