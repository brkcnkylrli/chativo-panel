/**
 * Chativo eki: gomulu mod.
 *
 * Widget normalde bir sayfanin kosesinde, SDK tarafindan acilip kapanan bir
 * pencere olarak yasiyor. Demo sayfalarinda ise (demo.chativo.tr) dogrudan
 * bir iframe'e gomuluyor: SDK yok, pencere zaten surekli acik.
 *
 * Bu fark bir hataya yol aciyordu. Widget "acik miyim" sorusunu SDK'dan gelen
 * bilgiyle cevapliyor; SDK olmayinca kendini **kapali** saniyor. Asistan cevap
 * yazdiginda okunmamis mesaj sayisi artiyor ve widget "okunmamis mesajlar"
 * ekranina atliyordu: sohbet gozden kayboluyor, yerine "tum mesajlari gor"
 * karti geliyordu. Karsidaki kisi her cevapta sohbetten atilmis gibi
 * hissediyordu.
 *
 * Gomulu modda okunmamis ekrani hic acilmiyor. Adres satirindan geliyor
 * cunku bu sayfalarda SDK ve dolayisiyla `config-set` mesaji yok - ayarin
 * ulasabilecegi tek yol adres.
 */

/** Widget gomulu modda mi calisiyor. */
export const gomuluModAcik = () => {
  if (typeof window === 'undefined' || !window.location) {
    return false;
  }

  try {
    return new URLSearchParams(window.location.search).get('gomulu') === '1';
  } catch (hata) {
    return false;
  }
};
