"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hangulTools = void 0;
const hangulTools = () => {
    const HANGUL_FIRST = '가';
    const HANGUL_LAST = '힣';
    const HANGUL_FIRST_CODE = HANGUL_FIRST.charCodeAt(0);
    const CHOSEONG = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
    const JUNGSEONG = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ';
    const JONGSEONG = 'Xㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ';
    const toChoseong = (param) => param
        .split('')
        .map((char) => char >= HANGUL_FIRST && char <= HANGUL_LAST
        ? CHOSEONG[Math.floor((char.charCodeAt(0) - HANGUL_FIRST_CODE) /
            (JUNGSEONG.length * JONGSEONG.length))]
        : char)
        .join('');
    return {
        toChoseong,
    };
};
exports.hangulTools = hangulTools;
//# sourceMappingURL=hangul.js.map