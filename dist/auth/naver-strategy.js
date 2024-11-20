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
exports.NaverStrategy = void 0;
const passport_1 = require("@nestjs/passport");
const passport_naver_1 = require("passport-naver");
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
let NaverStrategy = class NaverStrategy extends (0, passport_1.PassportStrategy)(passport_naver_1.Strategy) {
    constructor(authService) {
        super({
            clientID: process.env.NAVER_CLIENT_ID,
            clientSecret: process.env.NAVER_CLIENT_SECRET,
            callbackURL: process.env.NAVER_CALLBACK_URL,
        });
        this.authService = authService;
    }
    async validate(accessToken, refreshToken, profile, done) {
        const id = profile._json.id;
        const provider = 'naver';
        const name = profile._json.nickname;
        const image = profile._json.profile_image;
        const user = {
            id,
            name,
            image,
            provider,
        };
        return done(null, user);
    }
};
exports.NaverStrategy = NaverStrategy;
exports.NaverStrategy = NaverStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], NaverStrategy);
//# sourceMappingURL=naver-strategy.js.map