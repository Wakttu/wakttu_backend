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
exports.QueryRoomDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class QueryRoomDto {
}
exports.QueryRoomDto = QueryRoomDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '초보만 오세요',
        description: '게임 room의 방제목',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryRoomDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 6,
        description: '가져올 데이터 개수',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], QueryRoomDto.prototype, "take", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 6,
        description: '스킵하는 데이터 개수',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], QueryRoomDto.prototype, "skip", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: '게임 중 포함 미포함',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Number)
], QueryRoomDto.prototype, "start", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '[1,0,1,0,1]',
        description: '방의 옵션을 키고 끄는 내용을 정할수 있음.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], QueryRoomDto.prototype, "option", void 0);
//# sourceMappingURL=query-room.dto.js.map