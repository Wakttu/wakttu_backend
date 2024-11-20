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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KungService = void 0;
const common_1 = require("@nestjs/common");
const socket_gateway_1 = require("../socket/socket.gateway");
let KungService = class KungService {
    constructor(socketGateway) {
        this.socketGateway = socketGateway;
    }
    setRule(roomId) {
        this.server.to(roomId).emit('setRule', '금지어를 설정해주세요');
    }
    handleTest() {
        console.log(this.server);
        this.server.emit('kung', 'testing');
    }
};
exports.KungService = KungService;
exports.KungService = KungService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)((0, common_1.forwardRef)(() => socket_gateway_1.SocketGateway))),
    __metadata("design:paramtypes", [socket_gateway_1.SocketGateway])
], KungService);
//# sourceMappingURL=kung.service.js.map