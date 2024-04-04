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
exports.CreateRoomDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateRoomDto {
}
exports.CreateRoomDto = CreateRoomDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '초보만 오세요',
        description: '게임 room의 방제목',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRoomDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '123456',
        description: '방의 비밀번호가 있을경우 입력가능',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRoomDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '1',
        description: '게임종류에 따라 번호를 나눌예정 현재는 1번을 끝말잇기로 생각하자',
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateRoomDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
<<<<<<< HEAD
        example: '6',
        description: '라운드 수',
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateRoomDto.prototype, "round", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '[매너, 품어]',
        description: '방의 옵션을 키고 끄는 내용을 정할수 있음.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ each: true }),
=======
        example: '[1,0,1,0,1]',
        description: '방의 옵션을 키고 끄는 내용을 정할수 있음.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ each: true }),
>>>>>>> 960b922 (feat: Room CRUD)
    __metadata("design:type", Array)
], CreateRoomDto.prototype, "option", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '8', description: '인원수설정하는값' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
<<<<<<< HEAD
], CreateRoomDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '600000', description: '라운드 시간 ms 단위' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateRoomDto.prototype, "time", void 0);
=======
], CreateRoomDto.prototype, "count", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'xdffqe', description: '방장의 id값 naver의 id' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRoomDto.prototype, "masterId", void 0);
>>>>>>> 960b922 (feat: Room CRUD)
//# sourceMappingURL=create-room.dto.js.map