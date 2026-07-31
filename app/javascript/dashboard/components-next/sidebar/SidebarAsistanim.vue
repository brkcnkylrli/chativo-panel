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
import Auth from 'dashboard/api/auth';
import { useAlert } from 'dashboard/composables';
import Icon from 'next/icon/Icon.vue';

defineProps({
  isCollapsed: { type: Boolean, default: false },
});

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
    const token = kimlik['access-token'] || kimlik.accessToken;

    if (!token) throw new Error('oturum bulunamadi');

    const cevap = await fetch(`${kopruAdresi}/musteri/panel-baglantisi`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chatwootToken: token }),
    });

    if (!cevap.ok) throw new Error(`kopru ${cevap.status}`);

    const { adres } = await cevap.json();
    if (!adres) throw new Error('adres donmedi');

    // Yeni sekme: musteri panelde acik olan konusmayi kaybetmesin.
    window.open(adres, '_blank', 'noopener');
  } catch (err) {
    useAlert('Asistan ayarları açılamadı, birazdan tekrar deneyin.');
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
    :title="isCollapsed ? 'Asistanım' : undefined"
    @click="ac"
  >
    <Icon icon="i-lucide-bot" class="flex-shrink-0 size-4" />
    <span v-if="!isCollapsed" class="truncate">Asistanım</span>
  </button>
</template>
