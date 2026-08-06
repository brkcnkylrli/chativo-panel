/**
 * Chativo eki: asistan modu.
 *
 * Bu widget'i bir yapay zeka asistani yonetiyor demek. Iki seyi degistiriyor:
 *
 *   - Baslikta her zaman **cevrimici** yaziyor ve yesil nokta yaniyor.
 *     Chatwoot'un varsayilan davranisi "musait temsilci var mi" sorusuna
 *     bakiyor; asistanli bir gelen kutusunda insan temsilci cogu zaman
 *     cevrimdisi oluyor ve widget "operatorlerimiz musait degil" diyordu -
 *     oysa asistan saniyeler icinde cevap veriyor.
 *   - "Genellikle birkac dakika icinde yanit verir" metni kalkiyor. Asistan
 *     dakikalar icinde degil aninda cevapliyor; o cumle urunu oldugundan
 *     yavas gosteriyordu.
 *
 * Iki kaynaktan geliyor, ikisi de ayni sonuca cikiyor:
 *   1. SDK ile gomen sayfalar: `chatwootSettings.asistanModu`
 *   2. Widget'i dogrudan iframe'e alan sayfalar: adreste `asistan=1`
 *      (bu sayfalarda SDK ve `config-set` yok, tek yol adres)
 */

/** Adres satirinda asistan modu isaretli mi. */
export const asistanModuAcik = () => {
  if (typeof window === 'undefined' || !window.location) {
    return false;
  }

  try {
    return new URLSearchParams(window.location.search).get('asistan') === '1';
  } catch (hata) {
    return false;
  }
};
