/**
 * Chativo eki: widget acilisindaki hazir sorular.
 *
 * Acilis ekraninda tiklanabilir birkac soru duruyor; tiklayan ziyaretci hic
 * yazmadan cevabi goruyor. Sorular firmadan firmaya degisiyor (transfer
 * firmasinin sorusu klinige uymuyor), bu yuzden metin urune gomulu degil,
 * widget'i cagiran sayfadan geliyor.
 *
 * Iki kaynak var, ikisi de ayni listeye cikiyor:
 *
 *   1. SDK ile gomen sayfalar (landing): `chatwootSettings.hazirSorular`
 *      dizisi, `config-set` mesajiyla appConfig'e dusuyor.
 *   2. Widget'i dogrudan iframe'e alan sayfalar (demo.chativo.tr): adresteki
 *      `hazir_sorular` parametresi. Bu sayfalarda SDK calismadigi icin
 *      `config-set` hic gelmiyor, tek yol adres satiri.
 *
 * Veritabanina yeni bir alan eklenmedi: boylece fork upstream'den uzaklasmiyor
 * ve her sayfa kendi sorusunu kendisi belirliyor.
 */

/** Adres satirindaki sorulari ayiran karakter. */
const AYIRAC = '|';

/**
 * Dort soru siniri gorunum karari: acilis ekraninda daha fazlasi yazi
 * alanini asagi itiyor ve liste "menu" gibi okunmaya basliyor.
 */
const EN_FAZLA = 4;

/** Uzun bir soru iki satiri asiyor ve dugmeyi bozuyor. */
const EN_UZUN_SORU = 120;

/**
 * Gelen ham degeri temiz bir soru listesine cevirir.
 * Dizi de kabul eder (SDK yolu), ayrac ile birlesik metin de (adres yolu).
 */
export const hazirSorulariAyikla = ham => {
  if (!ham) {
    return [];
  }

  const parcalar = Array.isArray(ham) ? ham : String(ham).split(AYIRAC);

  return parcalar
    .map(parca => String(parca ?? '').trim())
    .filter(parca => parca && parca.length <= EN_UZUN_SORU)
    .slice(0, EN_FAZLA);
};

/**
 * Widget'in kendi adresindeki `hazir_sorular` parametresini okur.
 * Tarayici disinda (test, sunucu tarafi) cagrilirsa bos liste doner.
 */
export const adrestenHazirSorular = () => {
  if (typeof window === 'undefined' || !window.location) {
    return [];
  }

  try {
    const parametreler = new URLSearchParams(window.location.search);
    return hazirSorulariAyikla(parametreler.get('hazir_sorular'));
  } catch (hata) {
    return [];
  }
};
