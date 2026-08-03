<script setup>
/**
 * "Asistanım" dugmesi.
 *
 * Asistan ayarlari (kurulum sorulari, fiyatlar, sik sorulanlar) koprude
 * yasiyor ve gizli bir anahtarla korunuyor. O anahtar panele gomulemez: her
 * musteride farkli ve panel derlenirken bilinmiyor.
 *
 * Bu yuzden akis tersine calisiyor: panel kendi Chatwoot oturumunu kanitliyor,
 * kopru karsiliginda dogru adresi donuyor. Kullanici yalnizca uyesi oldugu
 * hesabin adresini alabiliyor.
 *
 * Onceden musteri asistanini duzenlemek icin e-postasindaki baglantiyi bulmak
 * zorundaydi; panelde hicbir yol yoktu.
 */
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Auth from 'dashboard/api/auth';
import { useAlert } from 'dashboard/composables';
import Icon from 'next/icon/Icon.vue';

/*
 * Bilesen iki menu ogesini de karsiliyor: "Asistanim" panelin basina,
 * "Aboneligim" paket bolumune gidiyor. Ikisi ayni dogrulama akisini
 * kullaniyor; ayri bilesen yazmak o akisi iki yerde tutmak olurdu.
 */
const props = defineProps({
  isCollapsed: { type: Boolean, default: false },
  /** Koprunun capaya cevirdigi bolum adi. Bos ise panelin basi. */
  bolum: { type: String, default: '' },
  etiket: { type: String, default: 'SIDEBAR.ASISTANIM' },
  ikon: { type: String, default: 'i-lucide-bot' },
});

const { t } = useI18n();
const yukleniyor = ref(false);

// Kopru adresi derleme aninda bilinmiyor; panelin acildigi alan adindan
// turetilemiyor da (panel app.*, kopru wa.*). Sunucudan gelen yapilandirmada
// varsa o kullaniliyor, yoksa dugme hic gorunmuyor.
const kopruAdresi = window.chatwootConfig?.chativoBridgeUrl || '';

const ac = async () => {
  if (yukleniyor.value || !kopruAdresi) return;
  yukleniyor.value = true;

  try {
    const kimlik = Auth.getAuthData() || {};

    if (!kimlik['access-token'] || !kimlik.client || !kimlik.uid) {
      throw new Error('oturum bulunamadi');
    }

    // Oturumun tamami gonderiliyor: access-token tek basina bir API anahtari
    // degil. Onceden yalnizca o gonderiliyordu, kopru de onu API anahtari
    // sanip Chatwoot'a oyle soruyordu; Chatwoot 401 donuyor ve dugme
    // "Asistan ayarlari acilamadi" veriyordu. Chatwoot oturumu dogrulamak
    // icin access-token, client ve uid ucunu birden istiyor.
    const cevap = await fetch(`${kopruAdresi}/musteri/panel-baglantisi`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ oturum: kimlik, bolum: props.bolum }),
    });

    if (!cevap.ok) throw new Error(`kopru ${cevap.status}`);

    const { adres } = await cevap.json();
    if (!adres) throw new Error('adres donmedi');

    // Yeni sekme: musteri panelde acik olan konusmayi kaybetmesin.
    window.open(adres, '_blank', 'noopener');
  } catch (err) {
    useAlert(t('SIDEBAR.ASISTANIM_HATA'));
  } finally {
    yukleniyor.value = false;
  }
};
</script>

<template>
  <button
    v-if="kopruAdresi"
    type="button"
    class="flex items-center w-full gap-2 px-2 py-1.5 rounded-lg text-sm text-n-slate-11 hover:bg-n-alpha-1 hover:text-n-slate-12 disabled:opacity-60"
    :class="isCollapsed ? 'justify-center' : ''"
    :disabled="yukleniyor"
    :title="isCollapsed ? t(etiket) : undefined"
    @click="ac"
  >
    <Icon :icon="ikon" class="flex-shrink-0 size-4" />
    <span v-if="!isCollapsed" class="truncate">{{ t(etiket) }}</span>
  </button>
</template>
