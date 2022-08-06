
export const letterReg = /[a-zA-Z]/g;
export const chineseCharacterReg = /[\u4e00-\u9fa5]/g;

export const getTargetAndSource = (conditionText: string) => {

  const letter = conditionText.match(letterReg);
  const chineseCharacter = conditionText.match(chineseCharacterReg);

  let to = 'zh';
  let from = 'en';

  if (!letter || (chineseCharacter && chineseCharacter.length > letter.length)) {
    to = 'en';
    from = 'zh';
  }

  return { to, from }
}
