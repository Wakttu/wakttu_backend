"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateDictionaryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_dictionary_dto_1 = require("./create-dictionary.dto");
class UpdateDictionaryDto extends (0, swagger_1.PartialType)(create_dictionary_dto_1.CreateDictionaryDto) {
}
exports.UpdateDictionaryDto = UpdateDictionaryDto;
//# sourceMappingURL=update-dictionary.dto.js.map