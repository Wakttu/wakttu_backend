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
        example: '1,1',
        description: '품사의 종류에 따라 번호 부여. 1=>명사 품사가 여러개일 경우 그에 따라 ,를 통해 추가',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDictionaryDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '{1}, [1], 1',
        description: '사용안할 예정. 왜냐면 의미의 경우 저작권이 존재',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDictionaryDto.prototype, "mean", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2',
        description: '먼용도인지모르겠음',
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateDictionaryDto.prototype, "flag", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '320',
        description: '번호를 통해 주제를 나눔, 나중에 다른 방식으로 수정예정',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDictionaryDto.prototype, "theme", void 0);
//# sourceMappingURL=create-dictionary.dto.js.map