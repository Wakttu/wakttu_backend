"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionAdapter = void 0;
const platform_socket_io_1 = require("@nestjs/platform-socket.io");
class SessionAdapter extends platform_socket_io_1.IoAdapter {
    constructor(session, app) {
        super(app);
        this.session = session;
    }
    create(port, options) {
        const server = super.create(port, options);
        const wrap = (middleware) => (socket, next) => middleware(socket.request, {}, next);
        server.use((socket, next) => {
            next();
        });
        server.use(wrap(this.session));
        return server;
    }
}
exports.SessionAdapter = SessionAdapter;
//# sourceMappingURL=session.adapter.js.map