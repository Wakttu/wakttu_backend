"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BellModule = void 0;
const common_1 = require("@nestjs/common");
const bell_service_1 = require("./bell.service");
const socket_module_1 = require("../socket/socket.module");
let BellModule = class BellModule {
};
exports.BellModule = BellModule;
exports.BellModule = BellModule = __decorate([
    (0, common_1.Module)({
        imports: [(0, common_1.forwardRef)(() => socket_module_1.SocketModule)],
        providers: [bell_service_1.BellService],
        exports: [bell_service_1.BellService],
    })
], BellModule);
//# sourceMappingURL=bell.module.js.map