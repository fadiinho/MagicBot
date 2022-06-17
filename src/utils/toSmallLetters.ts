/*
 * Source: https://github.com/guiguicdd/wabase-md/blob/main/lib/global.js
 */
export function toSmallLetters(text: string) {
  var mapObj = {
    a: 'ᵃ',
    á: 'ᵃ',
    ã: 'ᵃ',
    b: 'ᵇ',
    c: 'ᶜ',
    ç: 'ᶜ',
    d: 'ᵈ',
    e: 'ᵉ',
    é: 'ᵉ',
    ê: 'ᵉ',
    f: 'ᶠ',
    g: 'ᵍ',
    h: 'ʰ',
    i: 'ᶦ',
    j: 'ʲ',
    k: 'ᵏ',
    l: 'ˡ',
    m: 'ᵐ',
    n: 'ⁿ',
    o: 'ᵒ',
    õ: 'ᵒ',
    ô: 'ᵒ',
    p: 'ᵖ',
    q: 'ᑫ',
    r: 'ʳ',
    s: 'ˢ',
    t: 'ᵗ',
    u: 'ᵘ',
    ú: 'ᵘ',
    v: 'ᵛ',
    w: 'ʷ',
    x: 'ˣ',
    y: 'ʸ',
    z: 'ᶻ',
    0: '⁰',
    1: '¹',
    2: '²',
    3: '³',
    4: '⁴',
    5: '⁵',
    6: '⁶',
    7: '⁷',
    8: '⁸',
    9: '⁹'
  };
  const abbreviations = Object.keys(mapObj);
  for (let i = 0; i < abbreviations.length; i++) {
    const regexp = new RegExp(abbreviations[i], 'gi');
    text = text.replace(regexp, mapObj[abbreviations[i]]);
  }

  return text;
}
