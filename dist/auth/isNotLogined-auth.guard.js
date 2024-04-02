"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsNotLoginedGuard = void 0;
const common_1 = require("@nestjs/common");
let IsNotLoginedGuard = class IsNotLoginedGuard {
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const check = this.checkUser(request.session);
        if (!check)
            throw new common_1.ForbiddenException({ message: '로그인 중 입니다!' });
        return true;
    }
    checkUser(session) {
        return session.user ? false : true;
    }
};
exports.IsNotLoginedGuard = IsNotLoginedGuard;
exports.IsNotLoginedGuard = IsNotLoginedGuard = __decorate([
    (0, common_1.Injectable)()
], IsNotLoginedGuard);
//# sourceMappingURL=isNotLogined-auth.guard.js.map