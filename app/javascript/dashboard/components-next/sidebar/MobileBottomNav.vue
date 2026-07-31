<script setup>
/**
 * Mobil alt gezinme cubugu.
 *
 * Mobilde tek gezinme yolu sol menuydu: her bolum degisikligi icin once
 * hamburger'a, sonra menudeki satira dokunmak gerekiyordu. Alt cubuk en cok
 * kullanilan dort bolumu tek dokunusa indiriyor.
 *
 * Yalnizca kucuk ekranda gorunuyor; masaustunde sol menu zaten yeterli ve
 * ekranin altini kaplamak orada yer israfi olurdu.
 */
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useMapGetter } from 'dashboard/composables/store';
import { useAccount } from 'dashboard/composables/useAccount';
import { useI18n } from 'vue-i18n';

const { accountScopedRoute } = useAccount();
const route = useRoute();
const { t } = useI18n();

const bildirimBilgisi = useMapGetter('notifications/getMeta');
const okunmamisBildirim = computed(
  () => bildirimBilgisi.value?.unreadCount ?? 0
);

/**
 * Bolumler.
 *
 * `eslesen`: rota adinin bu onekle baslamasi o sekmeyi etkin sayiyor. Rota
 * adiyla birebir karsilastirma yetmiyor - ornegin bir konusma acildiginda
 * rota adi degisiyor ama kullanici hala Konusmalar bolumunde.
 */
const bolumler = computed(() => [
  {
    ad: 'konusmalar',
    etiket: t('SIDEBAR.CONVERSATIONS'),
    hedef: accountScopedRoute('home'),
    eslesen: ['home', 'inbox_conversation', 'conversation_through', 'folder_conversations', 'label_conversations', 'team_conversations'],
    ikon: 'M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 7 4 5 6.5 5H18c2.2 0 4 1.8 4 4z',
  },
  {
    ad: 'kisiler',
    etiket: t('SIDEBAR.CONTACTS'),
    hedef: accountScopedRoute('contacts_dashboard_active'),
    eslesen: ['contacts_dashboard'],
    ikon: 'M18 21a8 8 0 0 0-16 0M10 3a5 5 0 1 0 0 10a5 5 0 0 0 0-10',
  },
  {
    ad: 'bildirimler',
    etiket: t('SIDEBAR.NOTIFICATIONS'),
    hedef: accountScopedRoute('notifications_index'),
    eslesen: ['notifications'],
    ikon: 'M10.268 21a2 2 0 0 0 3.464 0M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326',
    rozet: okunmamisBildirim,
  },
  {
    ad: 'ayarlar',
    etiket: t('SIDEBAR.SETTINGS'),
    hedef: accountScopedRoute('general_settings_index'),
    eslesen: ['settings', 'general_settings', 'agent_list', 'security_settings'],
    ikon: 'M9.671 4.136a2.34 2.34 0 0 1 4.659 0a2.34 2.34 0 0 0 3.319 1.915a2.34 2.34 0 0 1 2.33 4.033a2.34 2.34 0 0 0 0 3.831a2.34 2.34 0 0 1-2.33 4.033a2.34 2.34 0 0 0-3.319 1.915a2.34 2.34 0 0 1-4.659 0a2.34 2.34 0 0 0-3.32-1.915a2.34 2.34 0 0 1-2.33-4.033a2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915',
    ikonEk: 'M12 15a3 3 0 1 0 0-6a3 3 0 0 0 0 6',
  },
]);

const etkinMi = bolum => {
  const ad = route.name ?? '';
  return bolum.eslesen.some(onek => ad.startsWith(onek));
};
</script>

<template>
  <nav class="chativo-alt-cubuk" :aria-label="$t('SIDEBAR.CONVERSATIONS')">
    <RouterLink
      v-for="bolum in bolumler"
      :key="bolum.ad"
      :to="bolum.hedef"
      class="chativo-alt-oge"
      :class="{ 'chativo-alt-etkin': etkinMi(bolum) }"
    >
      <span class="chativo-alt-ikon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path :d="bolum.ikon" />
          <path v-if="bolum.ikonEk" :d="bolum.ikonEk" />
        </svg>
        <span
          v-if="bolum.rozet && bolum.rozet.value > 0"
          class="chativo-alt-rozet"
        >
          {{ bolum.rozet.value > 99 ? '99+' : bolum.rozet.value }}
        </span>
      </span>
      <span class="chativo-alt-etiket">{{ bolum.etiket }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
/*
 * Yuzen ve saydam: cubuk icerigin uzerinde duruyor, arkasindaki liste
 * bulaniklastirilarak gorunmeye devam ediyor. Ekranin altini duz bir seritle
 * kapatmak, zaten dar olan mobil alanini daha da kisaltiyordu.
 */
.chativo-alt-cubuk {
  position: fixed;
  z-index: 40;
  bottom: max(12px, env(safe-area-inset-bottom));
  left: 12px;
  right: 12px;
  display: flex;
  align-items: stretch;
  justify-content: space-around;
  gap: 2px;
  padding: 6px 8px;
  border-radius: 999px;
  background: rgb(31 36 48 / 78%);
  border: 1px solid rgb(255 255 255 / 8%);
  box-shadow: 0 8px 28px rgb(0 0 0 / 32%);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
}

/* Masaustunde sol menu zaten var; alt cubuk yalnizca dar ekranda. */
@media (width >= 1024px) {
  .chativo-alt-cubuk {
    display: none;
  }
}

.chativo-alt-oge {
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  gap: 3px;
  align-items: center;
  justify-content: center;
  padding: 7px 4px 5px;
  border-radius: 999px;
  color: rgb(174 180 194);
  text-decoration: none;
  transition: color 120ms ease, background-color 120ms ease;
}

.chativo-alt-etkin {
  color: rgb(255 255 255);
  background: rgb(110 76 255 / 22%);
}

.chativo-alt-ikon {
  position: relative;
  display: flex;
}

.chativo-alt-ikon svg {
  width: 21px;
  height: 21px;
}

.chativo-alt-etiket {
  font-size: 10px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0.01em;

  /* Uzun etiketler cubugu bozmasin. */
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chativo-alt-rozet {
  position: absolute;
  top: -4px;
  inset-inline-start: 11px;
  min-width: 15px;
  padding: 0 4px;
  font-size: 9px;
  font-weight: 600;
  line-height: 15px;
  color: rgb(255 255 255);
  text-align: center;
  background: rgb(224 49 49);
  border-radius: 999px;
}
</style>
