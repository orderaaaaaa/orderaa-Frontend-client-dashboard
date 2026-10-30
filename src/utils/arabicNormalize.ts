export function normalizeArabic(input: string): string {
  if (input === null || input === undefined) return '';

  return (
    String(input)
      .normalize('NFKC')
      .toLowerCase()
      .trim()

      .replace(/\u0640/g, '')

      .replace(/[\u064B-\u065F\u0610-\u061A\u06D6-\u06ED\u0670]/g, '')
      .replace(/[ًٌٍَُِّّْ]/g, '')

      .replace(/[أإآٱ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/ی/g, 'ي')
      .replace(/ک/g, 'ك')

      .replace(new RegExp(String.raw`(?<=\d)[^\p{L}\p{N}]+(?=\d)`, 'gu'), '-')

      .replace(new RegExp(String.raw`(?<=\d)\s*-\s*(?=\d)`, 'g'), '-')

      .replace(new RegExp(String.raw`[^\p{L}\p{N}\s-]`, 'gu'), ' ')

      .replace(/\s+/g, ' ')
      .trim()
  );
}
