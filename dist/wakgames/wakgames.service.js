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
exports.WakgamesService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const backend_sdk_1 = require("@wakgames/backend-sdk");
let WakgamesService = class WakgamesService extends backend_sdk_1.WakGames {
    constructor(configService) {
        super({
            clientId: configService.get('CLIENT_ID'),
            redirectUrl: configService.get('CALLBACK_URL'),
        });
        this.configService = configService;
        this.typeHandlers = new Map([
            ['WOO', () => ['WOO-1']],
            ['INE', (word) => ['INE-1', ...(word.id === '오야' ? ['INE-2'] : [])]],
            [
                'JINGBURGER',
                (word) => [
                    'JING-1',
                    ...(word.meta?.tag.includes('어록') ? ['JING-2'] : []),
                ],
            ],
            ['LILPA', (word) => ['LIL-1', ...(word.id === '띨파' ? ['LIL-2'] : [])]],
            [
                'JURURU',
                (word) => [
                    'JU-1',
                    ...(word.id === '주폭도' || word.id === '주스단' || word.id === '려우'
                        ? ['JU-2']
                        : []),
                ],
            ],
            [
                'GOSEGU',
                (word) => [
                    'GO-1',
                    ...(word.meta?.tag.includes('콘텐츠') ? ['GO-2'] : []),
                ],
            ],
            [
                'VIICHAN',
                (word) => ['VIi-1', ...(word.id.includes('복숭아') ? ['VIi-2'] : [])],
            ],
            [
                'GOMEM',
                (word) => [
                    ...(word.meta?.tag.includes('고멤') ? ['GOM-1'] : []),
                    ...(word.meta?.tag.includes('아카데미') ? ['GOM-2'] : []),
                ],
            ],
        ]);
    }
    getAuth() {
        return this.oauth.getAuthorizeUrl();
    }
    async getToken(auth) {
        const query = {
            grantType: 'authorization_code',
            clientId: this.clientId,
            code: auth.code,
            verifier: auth.codeVerifier,
            callbackUri: this.redirectUrl,
        };
        return await this.oauth.token(query);
    }
    async updateToken(refreshToken) {
        return await this.oauth.refresh(refreshToken);
    }
    async getProfile(accessToken) {
        return await this.gameLink.getProfile(accessToken);
    }
    async getAchieve(accessToken) {
        return await this.gameLink.getAchieves(accessToken);
    }
    async postAchieve(query, accessToken) {
        return await this.gameLink.postAchieve(query, accessToken);
    }
    async getStat(query, accessToken) {
        return await this.gameLink.getStat(query, accessToken);
    }
    async putStat(body, accessToken) {
        return await this.gameLink.putStat(body, accessToken);
    }
    async refreshTokenIfNeeded(session) {
        const { data, response } = await this.updateToken(session.refreshToken);
        if (response.status !== 200)
            throw new common_1.UnauthorizedException();
        session.accessToken = data.accessToken;
        session.refreshToken = data.refreshToken;
        return session.accessToken;
    }
    async putResult(body, session) {
        const map = new Map();
        body.forEach((item) => {
            if (item.type !== 'WORD')
                return;
            const statId = this.getId(item.word);
            statId.forEach((id) => {
                map.set(id, (map.get(id) || 0) + 1);
            });
        });
        try {
            const statsPromises = Array.from(map.entries()).map(async ([key, increment]) => {
                try {
                    const { data, response } = await this.getStat({ id: key }, session.accessToken);
                    if (response.status === 401) {
                        const newToken = await this.refreshTokenIfNeeded(session);
                        const { data } = await this.getStat({ id: key }, newToken);
                        const val = data.size > 0 ? data.stats[0].val : 0;
                        return { id: key, val: val + increment };
                    }
                    const val = data.size > 0 ? data.stats[0].val : 0;
                    return { id: key, val: val + increment };
                }
                catch (error) {
                    console.error(`Error fetching stat for key ${key}:`, error);
                    throw error;
                }
            });
            const stats = await Promise.all(statsPromises);
            try {
                const { data, response } = await this.putStat({ stats }, session.accessToken);
                if (response.status === 401) {
                    const newToken = await this.refreshTokenIfNeeded(session);
                    return await this.putStat({ stats }, newToken);
                }
                return data;
            }
            catch (error) {
                console.error('Error updating stats:', error);
                throw error;
            }
        }
        catch (error) {
            console.error('Error in putResult:', error);
            throw error;
        }
    }
    getId(word) {
        const handler = this.typeHandlers.get(word.type);
        return handler ? handler(word) : [];
    }
};
exports.WakgamesService = WakgamesService;
exports.WakgamesService = WakgamesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], WakgamesService);
//# sourceMappingURL=wakgames.service.js.map