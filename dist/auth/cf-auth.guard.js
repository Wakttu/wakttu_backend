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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudflareGuard = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");
let CloudflareGuard = class CloudflareGuard {
    constructor(config) {
        const domain = config.get('CLOUD_DOMAIN');
        this.client = jwksClient({
            jwksUri: `https://${domain}/cdn-cgi/access/certs`,
            cache: true,
            cacheMaxEntries: 5,
            cacheMaxAge: 10 * 60 * 1000,
        });
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            console.error('JWT 없음: Authorization 헤더가 비어 있습니다.');
            return false;
        }
        try {
            const decoded = await this.verifyToken(token);
            request.user = decoded;
            return true;
        }
        catch (error) {
            console.error('JWT 검증 실패:', error.message);
            return false;
        }
    }
    async verifyToken(token) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, (header, callback) => this.getKey(header, callback), { algorithms: ['RS256'] }, (err, decoded) => {
                if (err) {
                    return reject(err);
                }
                resolve(decoded);
            });
        });
    }
    getKey(header, callback) {
        this.client.getSigningKey(header.kid, (err, key) => {
            if (err) {
                return callback(err, null);
            }
            const signingKey = key.getPublicKey();
            callback(null, signingKey);
        });
    }
};
exports.CloudflareGuard = CloudflareGuard;
exports.CloudflareGuard = CloudflareGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CloudflareGuard);
//# sourceMappingURL=cf-auth.guard.js.map