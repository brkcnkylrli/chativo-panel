import { hazirSorulariAyikla, adrestenHazirSorular } from '../hazirSorular';

describe('#hazirSorulariAyikla', () => {
  it('bos degerlerde bos liste dondurur', () => {
    expect(hazirSorulariAyikla(undefined)).toEqual([]);
    expect(hazirSorulariAyikla(null)).toEqual([]);
    expect(hazirSorulariAyikla('')).toEqual([]);
    expect(hazirSorulariAyikla([])).toEqual([]);
  });

  it('ayracli metni listeye cevirir', () => {
    expect(hazirSorulariAyikla('Fiyat nedir?|Kurulum ne kadar surer?')).toEqual(
      ['Fiyat nedir?', 'Kurulum ne kadar surer?']
    );
  });

  it('diziyi oldugu gibi kabul eder', () => {
    expect(hazirSorulariAyikla(['Bir', 'Iki'])).toEqual(['Bir', 'Iki']);
  });

  it('bosluklari kirpar ve bos parcalari atar', () => {
    expect(hazirSorulariAyikla('  Bir  ||  Iki ')).toEqual(['Bir', 'Iki']);
  });

  it('en fazla dort soru dondurur', () => {
    expect(hazirSorulariAyikla('a|b|c|d|e|f')).toEqual(['a', 'b', 'c', 'd']);
  });

  it('cok uzun sorulari atar', () => {
    const uzun = 'x'.repeat(121);
    expect(hazirSorulariAyikla(`Kisa|${uzun}`)).toEqual(['Kisa']);
  });
});

describe('#adrestenHazirSorular', () => {
  const gercekKonum = window.location;

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: gercekKonum,
    });
  });

  const konumuAyarla = arama => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...gercekKonum, search: arama },
    });
  };

  it('adreste parametre yoksa bos liste dondurur', () => {
    konumuAyarla('?website_token=abc');
    expect(adrestenHazirSorular()).toEqual([]);
  });

  it('adresteki sorulari okur', () => {
    konumuAyarla(
      `?website_token=abc&hazir_sorular=${encodeURIComponent(
        'Kasa kac para?|Bebek koltugu var mi?'
      )}`
    );
    expect(adrestenHazirSorular()).toEqual([
      'Kasa kac para?',
      'Bebek koltugu var mi?',
    ]);
  });
});
