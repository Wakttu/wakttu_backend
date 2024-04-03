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
exports.DictionaryController = void 0;
const common_1 = require("@nestjs/common");
const dictionary_service_1 = require("./dictionary.service");
const create_dictionary_dto_1 = require("./dto/create-dictionary.dto");
const update_dictionary_dto_1 = require("./dto/update-dictionary.dto");
const socket_gateway_1 = require("../socket/socket.gateway");
const swagger_1 = require("@nestjs/swagger");
let DictionaryController = class DictionaryController {
    constructor(dictionaryService, socketGateway) {
        this.dictionaryService = dictionaryService;
        this.socketGateway = socketGateway;
    }
    async create(createDictionaryDto) {
        return await this.dictionaryService.create(createDictionaryDto);
    }
    async findById(id) {
        return await this.dictionaryService.findById(id);
    }
    async update(id, updateDictionaryDto) {
        return await this.dictionaryService.update(id, updateDictionaryDto);
    }
    async remove(id) {
        return await this.dictionaryService.remove(id);
    }
    async check(id, req) {
        const server = this.socketGateway.server;
        const response = await this.dictionaryService.findById(id);
        console.log(req.user);
        if (!response) {
            server.emit('game', '존재하지않음');
        }
        else {
            server.emit('game', response);
        }
        return response;
    }
};
exports.DictionaryController = DictionaryController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '사전 단어 추가' }),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_dictionary_dto_1.CreateDictionaryDto]),
    __metadata("design:returntype", Promise)
], DictionaryController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '단어 추가 검색' }),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DictionaryController.prototype, "findById", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '사전 단어 수정' }),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_dictionary_dto_1.UpdateDictionaryDto]),
    __metadata("design:returntype", Promise)
], DictionaryController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '사전 단어 삭제' }),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DictionaryController.prototype, "remove", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'socket통신' }),
    (0, common_1.Get)('game/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DictionaryController.prototype, "check", null);
exports.DictionaryController = DictionaryController = __decorate([
    (0, common_1.Controller)('dictionary'),
    __metadata("design:paramtypes", [dictionary_service_1.DictionaryService,
        socket_gateway_1.SocketGateway])
], DictionaryController);
//# sourceMappingURL=dictionary.controller.js.map