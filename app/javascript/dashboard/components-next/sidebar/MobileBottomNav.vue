<script setup>
/**
 * Mobil alt gezinme cubugu.
 *
 * Mobilde tek gezinme yolu sol menuydu: her bolum degisikligi once hamburger'a,
 * sonra menudeki satira dokunmak istiyordu. Cubuk en cok kullanilan bolumleri
 * tek dokunusa indiriyor.
 *
 * Bes oge var ve ikisi gezinme degil, **acma** islemi: en soldaki menuyu, en
 * sagdaki profil menusunu aciyor. Ikisi de mobilde baska turlu ulasilamayan
 * yerlerdi - profil menusune (fotografa basinca cikan) hic erisim yoktu.
 *
 * Yalnizca kucuk ekranda gorunuyor; masaustunde sol menu zaten yeterli.
 */
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useMapGetter } from 'dashboard/composables/store';
import { useAccount } from 'dashboard/composables/useAccount';
import { useI18n } from 'vue-i18n';
import SidebarProfileMenu from './SidebarProfileMenu.vue';

const emit = defineEmits(['toggleSidebar', 'openKeyShortcutModal']);

const { accountScopedRoute } = useAccount();
const route = useRoute();
const { t } = useI18n();

const bildirimBilgisi = useMapGetter('notifications/getMeta');
const okunmamis = computed(() => bildirimBilgisi.value?.unreadCount ?? 0);

/**
 * Bir konusma acikken cubuk gizleniyor.
 *
 * O ekranda altta mesaj yazma kutusu var ve cubuk tam ustune biniyordu. Ayrica
 * konusma icindeyken gezinmek degil yazmak isteniyor; WhatsApp da sohbete
 * girildiginde alt cubugu kaldiriyor.
 */
const konusmaAcik = computed(() => Boolean(route.params.conversation_id));

const bolumler = computed(() => [
  {
    ad: 'konusmalar',
    etiket: t('SIDEBAR.CONVERSATIONS'),
    hedef: accountScopedRoute('home'),
    eslesen: ['home', 'inbox_conversation', 'conversation_through', 'folder_conversations', 'label_conversations', 'team_conversations', 'inbox_dashboard'],
    // Etkin olan dolu, digerleri cizgi: durum renge ek olarak bicimden de
    // okunuyor.
    dolu: 'M12 3c5 0 9 3.4 9 7.6 0 4.2-4 7.6-9 7.6-.9 0-1.8-.1-2.6-.3l-4.3 2.1a.6.6 0 0 1-.9-.7l1-3.3C3.2 14.7 3 12.7 3 10.6 3 6.4 7 3 12 3Z',
    cizgi: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  },
  {
    ad: 'bildirimler',
    etiket: t('SIDEBAR.NOTIFICATIONS'),
    hedef: accountScopedRoute('notifications_index'),
    eslesen: ['notifications'],
    dolu: 'M12 2a6 6 0 0 0-6 6c0 4.5-1.4 6-2.7 7.4a1 1 0 0 0 .7 1.6h16a1 1 0 0 0 .7-1.6C19.4 14 18 12.5 18 8a6 6 0 0 0-6-6Zm-1.7 18.5a2 2 0 0 0 3.4 0Z',
    cizgi: 'M10.3 20.5a2 2 0 0 0 3.4 0M4 16.6c1.3-1.4 2.7-2.9 2.7-7.4a5.3 5.3 0 0 1 10.6 0c0 4.5 1.4 6 2.7 7.4Z',
    sayac: okunmamis,
  },
  {
    ad: 'kisiler',
    etiket: t('SIDEBAR.CONTACTS'),
    hedef: accountScopedRoute('contacts_dashboard_active'),
    eslesen: ['contacts_dashboard'],
    dolu: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4 0-6 2.7-6 6a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1c0-3.3-2-6-6-6Z',
    cizgi: 'M18 20a6 6 0 0 0-12 0M12 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z',
  },
]);

const etkinMi = bolum => {
  const ad = route.name ?? '';
  return bolum.eslesen.some(onek => ad.startsWith(onek));
};
</script>

<template>
  <nav v-if="!konusmaAcik" class="chativo-alt-cubuk">
    <!-- Menu: sol menudeki her sey - kanallar, etiketler, hesap ayarlari. -->
    <button type="button" class="chativo-alt-oge" @click="emit('toggleSidebar')">
      <span class="chativo-alt-ikon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </span>
      <span class="chativo-alt-etiket">{{ $t('SIDEBAR.MENU') }}</span>
    </button>

    <RouterLink
      v-for="bolum in bolumler"
      :key="bolum.ad"
      :to="bolum.hedef"
      class="chativo-alt-oge"
      :class="{ 'chativo-alt-etkin': etkinMi(bolum) }"
    >
      <span class="chativo-alt-ikon">
        <svg
          v-if="etkinMi(bolum)"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path :d="bolum.dolu" />
        </svg>
        <svg
          v-else
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.9"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path :d="bolum.cizgi" />
        </svg>
        <span v-if="bolum.sayac && bolum.sayac.value > 0" class="chativo-alt-sayac">
          {{ bolum.sayac.value > 99 ? '99+' : bolum.sayac.value }}
        </span>
      </span>
      <span class="chativo-alt-etiket">{{ bolum.etiket }}</span>
    </RouterLink>

    <!-- Profil: fotografa basinca cikan menunun aynisi. -->
    <div class="chativo-alt-oge chativo-alt-profil">
      <SidebarProfileMenu
        is-collapsed
        @open-key-shortcut-modal="emit('openKeyShortcutModal')"
      />
      <span class="chativo-alt-etiket">{{ $t('SIDEBAR.PROFILE_SHORT') }}</span>
    </div>
  </nav>
</template>

<style scoped>
/*
 * Yuzen cam: cubuk icerigin uzerinde duruyor ve arkasindaki liste camin
 * icinden gorunmeye devam ediyor. Ekranin altini duz bir seritle kapatmak,
 * zaten dar olan mobil alanini daha da kisaltiyordu.
 *
 * Cam hissini veren uc sey birlikte calisiyor: yuksek bulaniklik, doygunluk
 * artisi (arkadaki renkler solmasin) ve ust kenardaki ince isik.
 */
.chativo-alt-cubuk {
  position: fixed;
  z-index: 40;
  bottom: max(12px, env(safe-area-inset-bottom));
  left: 10px;
  right: 10px;
  display: flex;
  gap: 2px;
  align-items: stretch;
  padding: 9px 6px 8px;
  background: rgb(22 24 29 / 62%);
  border: 1px solid rgb(255 255 255 / 9%);
  border-radius: 26px;
  box-shadow:
    0 10px 30px rgb(0 0 0 / 45%),
    inset 0 1px 0 rgb(255 255 255 / 6%);
  backdrop-filter: blur(24px) saturate(170%);
  -webkit-backdrop-filter: blur(24px) saturate(170%);
}

/* Masaustunde sol menu zaten var. */
@media (width >= 1024px) {
  .chativo-alt-cubuk {
    display: none;
  }
}

.chativo-alt-oge {
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  justify-content: flex-start;
  min-width: 0;
  padding: 0;
  color: rgb(107 114 128);
  text-decoration: none;
  background: none;
  border: 0;
  cursor: pointer;
  font-family: inherit;
}

.chativo-alt-etkin {
  color: rgb(231 233 238);
}

.chativo-alt-oge:focus-visible {
  outline: 2px solid rgb(110 76 255);
  outline-offset: 2px;
  border-radius: 14px;
}

.chativo-alt-ikon {
  position: relative;
  display: flex;
}

.chativo-alt-ikon svg {
  display: block;
  width: 22px;
  height: 22px;
}

.chativo-alt-etiket {
  max-width: 100%;
  overflow: hidden;
  font-size: 10px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0.01em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chativo-alt-sayac {
  position: absolute;
  top: -3px;
  inset-inline-start: 12px;
  box-sizing: content-box;
  min-width: 15px;
  height: 15px;
  padding: 0 4px;
  font-size: 9px;
  font-weight: 600;
  line-height: 15px;
  color: rgb(255 255 255);
  text-align: center;
  background: rgb(229 72 77);
  border: 2px solid rgb(20 22 27);
  border-radius: 999px;
}

/*
 * Profil menusu yukari acilmali: bilesen varsayilan olarak asagi aciyor ve
 * cubuk zaten ekranin en altinda - menu ekranin disinda kalirdi.
 */
.chativo-alt-profil {
  position: relative;
  gap: 4px;
}

.chativo-alt-profil :deep(.absolute) {
  top: auto;
  bottom: calc(100% + 14px);
  inset-inline-end: 0;
  inset-inline-start: auto;
}

.chativo-alt-profil :deep(button) {
  padding: 0;
  background: none;
}
</style>
