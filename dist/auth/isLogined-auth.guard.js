"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsLoginedGuard = void 0;
const common_1 = require("@nestjs/common");
let IsLoginedGuard = class IsLoginedGuard {
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const check = this.checkUser(request.session);
        if (check)
            throw new common_1.ForbiddenException({ message: '로그인 중이 아닙니다!' });
        return true;
    }
    checkUser(session) {
        return session.user ? false : true;
    }
};
exports.IsLoginedGuard = IsLoginedGuard;
exports.IsLoginedGuard = IsLoginedGuard = __decorate([
    (0, common_1.Injectable)()
], IsLoginedGuard);
//# sourceMappingURL=isLogined-auth.guard.js.map