type Props = {
  toChoseong: (param: string) => string;
};

export const hangulTools = (): Props => {
  const HANGUL_FIRST = '가';
  const HANGUL_LAST = '힣';
  const HANGUL_FIRST_CODE = HANGUL_FIRST.charCodeAt(0);

  const CHOSEONG = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
  const JUNGSEONG = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ';
  const JONGSEONG = 'Xㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ';

  /**
   * 문자열에서 초성(혹은 중성, 종성)만 추출하여 새로운 문자열을 반환한다.
   * @param param - 초성(혹은 중성, 종성)을 추출할 문자열
   * @returns 초성(혹은 중성, 종성)만으로 이루어진 새로운 문자열
   */
  const toChoseong = (param: string): string =>
    param
      .split('')
      .map((char) =>
        char >= HANGUL_FIRST && char <= HANGUL_LAST
          ? CHOSEONG[
              Math.floor(
                (char.charCodeAt(0) - HANGUL_FIRST_CODE) /
                  (JUNGSEONG.length * JONGSEONG.length),
              )
            ]
          : char,
      )
      .join('');

  return {
    toChoseong,
  };
};
