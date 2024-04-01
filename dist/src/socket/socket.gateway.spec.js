"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const socket_gateway_1 = require("./socket.gateway");
describe('SocketGateway', () => {
    let gateway;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [socket_gateway_1.SocketGateway],
        }).compile();
        gateway = module.get(socket_gateway_1.SocketGateway);
    });
    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });
});
//# sourceMappingURL=socket.gateway.spec.js.map