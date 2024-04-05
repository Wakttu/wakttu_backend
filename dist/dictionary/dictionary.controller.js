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
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../roles/roles.decorator");
const roles_guard_1 = require("../roles/roles.guard");
let DictionaryController = class DictionaryController {
    constructor(dictionaryService) {
        this.dictionaryService = dictionaryService;
    }
    async create(createDictionaryDto) {
        return await this.dictionaryService.create(createDictionaryDto);
    }
    async search(query) {
        const { keyword, take, skip } = {
            keyword: query.keyword,
            take: parseInt(query.take, 10) ? parseInt(query.take, 10) : 10,
            skip: parseInt(query.skip, 10) ? parseInt(query.skip, 10) : 0,
        };
        if (!keyword)
            return new common_1.BadRequestException();
        return await this.dictionaryService.search(keyword, take, skip);
    }
    async todayWord() {
        return await this.dictionaryService.todayWord();
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
<<<<<<< HEAD
    async checkManner(keyword) {
        return await this.dictionaryService.checkManner(keyword);
    }
    async findAll(id) {
        return await this.dictionaryService.findAll(id);
    }
=======
>>>>>>> 4b3bc0d (feat: turn 개발)
};
exports.DictionaryController = DictionaryController;
__decorate([
    (0, roles_decorator_1.Roles)(['manager', 'staff']),
    (0, swagger_1.ApiOperation)({ summary: '사전 단어 추가' }),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_dictionary_dto_1.CreateDictionaryDto]),
    __metadata("design:returntype", Promise)
], DictionaryController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '검색 기능' }),
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DictionaryController.prototype, "search", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '오늘의 단어' }),
    (0, common_1.Get)('today'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DictionaryController.prototype, "todayWord", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '단어 검색' }),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DictionaryController.prototype, "findById", null);
__decorate([
    (0, roles_decorator_1.Roles)(['manager', 'staff']),
    (0, swagger_1.ApiOperation)({ summary: '사전 단어 수정' }),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_dictionary_dto_1.UpdateDictionaryDto]),
    __metadata("design:returntype", Promise)
], DictionaryController.prototype, "update", null);
__decorate([
    (0, roles_decorator_1.Roles)(['manager']),
    (0, swagger_1.ApiOperation)({ summary: '사전 단어 삭제' }),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DictionaryController.prototype, "remove", null);
<<<<<<< HEAD
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '한방단어 인지 확인' }),
    (0, common_1.Get)('manner/:keyword'),
    __param(0, (0, common_1.Param)('keyword')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DictionaryController.prototype, "checkManner", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '입력한 단어로시작하는 단어' }),
    (0, common_1.Get)('all/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DictionaryController.prototype, "findAll", null);
=======
>>>>>>> 4b3bc0d (feat: turn 개발)
exports.DictionaryController = DictionaryController = __decorate([
<<<<<<< HEAD
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
=======
>>>>>>> 960b922 (feat: Room CRUD)
    (0, swagger_1.ApiTags)('Dictionary'),
    (0, common_1.Controller)('dictionary'),
    __metadata("design:paramtypes", [dictionary_service_1.DictionaryService])
], DictionaryController);
//# sourceMappingURL=dictionary.controller.js.map