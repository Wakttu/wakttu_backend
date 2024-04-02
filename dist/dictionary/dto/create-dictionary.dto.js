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
exports.CreateDictionaryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateDictionaryDto {
}
exports.CreateDictionaryDto = CreateDictionaryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '사과', description: '단어 그자체를 입력' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDictionaryDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '명사',
        description: '품사의 종류',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDictionaryDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '~ 한 뜻이다.',
        description: '뜻에 대하여 설명',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDictionaryDto.prototype, "mean", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '입력된 횟 수',
        description: '입력될 때마다 +1 됨.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateDictionaryDto.prototype, "hit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: '왁타버스 관련 단어일 경우, true 아니면 false',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Boolean)
], CreateDictionaryDto.prototype, "wakta", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: { bgm: 'url' },
        description: 'url, bgm 정보',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsJSON)(),
    __metadata("design:type", Object)
], CreateDictionaryDto.prototype, "meta", void 0);
//# sourceMappingURL=create-dictionary.dto.js.map