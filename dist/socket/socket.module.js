"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketModule = void 0;
const common_1 = require("@nestjs/common");
const socket_gateway_1 = require("./socket.gateway");
const socket_service_1 = require("./socket.service");
const room_module_1 = require("../room/room.module");
const dictionary_module_1 = require("../dictionary/dictionary.module");
const user_module_1 = require("../user/user.module");
const kung_module_1 = require("../kung/kung.module");
const last_module_1 = require("../last/last.module");
const bell_module_1 = require("../bell/bell.module");
const socket_auth_guard_1 = require("./socket-auth.guard");
let SocketModule = class SocketModule {
};
exports.SocketModule = SocketModule;
exports.SocketModule = SocketModule = __decorate([
    (0, common_1.Module)({
        imports: [
            user_module_1.UserModule,
            room_module_1.RoomModule,
            dictionary_module_1.DictionaryModule,
            (0, common_1.forwardRef)(() => last_module_1.LastModule),
            (0, common_1.forwardRef)(() => kung_module_1.KungModule),
            (0, common_1.forwardRef)(() => bell_module_1.BellModule),
        ],
        providers: [socket_gateway_1.SocketGateway, socket_service_1.SocketService, socket_auth_guard_1.SocketAuthenticatedGuard],
        exports: [socket_gateway_1.SocketGateway, socket_service_1.SocketService],
    })
], SocketModule);
//# sourceMappingURL=socket.module.js.map