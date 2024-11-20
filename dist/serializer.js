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
exports.SessionSerializer = void 0;
const passport_1 = require("@nestjs/passport");
const common_1 = require("@nestjs/common");
const user_service_1 = require("./user/user.service");
let SessionSerializer = class SessionSerializer extends passport_1.PassportSerializer {
    constructor(userService) {
        super();
        this.userService = userService;
    }
    async serializeUser(user, done) {
        done(null, user);
    }
    async deserializeUser(payload, done) {
        const response = await this.userService.findById(payload.id);
        const user = JSON.parse(JSON.stringify(response));
        delete user.password;
        return user ? done(null, user) : done(null, null);
    }
};
exports.SessionSerializer = SessionSerializer;
exports.SessionSerializer = SessionSerializer = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService])
], SessionSerializer);
//# sourceMappingURL=serializer.js.map