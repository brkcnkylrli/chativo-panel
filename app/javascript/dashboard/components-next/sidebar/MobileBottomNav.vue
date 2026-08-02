<script setup>
/**
 * Mobil alt gezinme cubugu.
 *
 * Mobilde tek gezinme yolu sol menuydu: her bolum degisikligi once
 * hamburger'a, sonra menudeki satira dokunmak istiyordu. Cubuk en cok
 * kullanilan bolumleri tek dokunusa indiriyor.
 *
 * Bes oge var ve ikisi gezinme degil **acma** islemi: en soldaki menuyu,
 * en sagdaki profil menusunu aciyor. Ortadaki ise yeni konusma basliyor -
 * onceden mobilde yeni konusma baslatmanin kisa yolu yoktu, menuyu acmak
 * gerekiyordu. Ortada durmasinin sebebi bas parmagin dogal olarak orada
 * olmasi.
 *
 * Yalnizca kucuk ekranda gorunuyor; masaustunde sol menu zaten yeterli.
 */
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useMapGetter } from 'dashboard/composables/store';
import { useAccount } from 'dashboard/composables/useAccount';
import { useI18n } from 'vue-i18n';
import SidebarProfileMenu from './SidebarProfileMenu.vue';
import ComposeConversation from 'dashboard/components-next/NewConversation/ComposeConversation.vue';

const emit = defineEmits([
  'toggleSidebar',
  'closeSidebar',
  'openKeyShortcutModal',
]);

const { accountScopedRoute } = useAccount();
const route = useRoute();
const { t } = useI18n();

const bildirimBilgisi = useMapGetter('notifications/getMeta');
const okunmamis = computed(() => bildirimBilgisi.value?.unreadCount ?? 0);

const okunmamisKonusma = useMapGetter(
  'conversationUnreadCounts/getAllUnreadCount'
);

/**
 * Bir konusma acikken cubuk gizleniyor.
 *
 * O ekranda altta mesaj yazma kutusu var ve cubuk tam ustune biniyordu.
 * Ayrica konusma icindeyken gezinmek degil yazmak isteniyor; WhatsApp da
 * sohbete girildiginde alt cubugu kaldiriyor.
 */
const konusmaAcik = computed(() => Boolean(route.params.conversation_id));

const bolumler = computed(() => [
  {
    ad: 'konusmalar',
    etiket: t('SIDEBAR.CONVERSATIONS'),
    hedef: accountScopedRoute('home'),
    eslesen: [
      'home',
      'inbox_conversation',
      'conversation_through',
      'folder_conversations',
      'label_conversations',
      'team_conversations',
      'inbox_dashboard',
    ],
    // Etkin olan dolu, digerleri cizgi: durum renge ek olarak bicimden de
    // okunuyor. Renk koru bir kullanici icin tek basina renk yeterli degil.
    dolu: 'M12 3c5 0 9 3.4 9 7.6 0 4.2-4 7.6-9 7.6-.9 0-1.8-.1-2.6-.3l-4.3 2.1a.6.6 0 0 1-.9-.7l1-3.3C3.2 14.7 3 12.7 3 10.6 3 6.4 7 3 12 3Z',
    cizgi: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
    // Konusmada yalnizca nokta, sayi yok: bkz. asagidaki not.
    // Duz deger, ic ice computed degil: `bolumler` zaten computed ve sayi
    // degistiginde yeniden hesaplaniyor. Ic ice computed her hesaplamada
    // yenisini yaratip birakirdi.
    nokta: okunmamisKonusma.value > 0,
  },
  {
    ad: 'bildirimler',
    etiket: t('SIDEBAR.NOTIFICATIONS'),
    hedef: accountScopedRoute('notifications_index'),
    eslesen: ['notifications'],
    dolu: 'M12 2a6 6 0 0 0-6 6c0 4.5-1.4 6-2.7 7.4a1 1 0 0 0 .7 1.6h16a1 1 0 0 0 .7-1.6C19.4 14 18 12.5 18 8a6 6 0 0 0-6-6Zm-1.7 18.5a2 2 0 0 0 3.4 0Z',
    cizgi:
      'M10.3 20.5a2 2 0 0 0 3.4 0M4 16.6c1.3-1.4 2.7-2.9 2.7-7.4a5.3 5.3 0 0 1 10.6 0c0 4.5 1.4 6 2.7 7.4Z',
    /*
     * Sayac yalnizca bildirimde.
     *
     * Uc ayri kirmizi daire panik havasi veriyordu. Bildirim "kac tane"
     * sorusunun cevabini gerektiriyor - hepsini tek tek gormek gerekiyor.
     * Okunmamis konusmada ise sayi karar degistirmiyor: zaten listeye
     * girilecek. Orada nokta yetiyor.
     */
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
    <button
      id="mobile-sidebar-launcher"
      type="button"
      class="chativo-alt-oge"
      :aria-label="$t('SIDEBAR.MENU')"
      @click="emit('toggleSidebar')"
    >
      <span class="chativo-alt-ikon">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.9"
          stroke-linecap="round"
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </span>
      <span class="chativo-alt-etiket">{{ $t('SIDEBAR.MENU') }}</span>
    </button>

    <RouterLink
      v-for="bolum in bolumler.slice(0, 1)"
      :key="bolum.ad"
      :to="bolum.hedef"
      class="chativo-alt-oge"
      :class="{ 'chativo-alt-etkin': etkinMi(bolum) }"
      @click="emit('closeSidebar')"
    >
      <span class="chativo-alt-ikon">
        <svg v-if="etkinMi(bolum)" viewBox="0 0 24 24" fill="currentColor">
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
        <span v-if="bolum.nokta" class="chativo-alt-nokta" />
      </span>
      <span class="chativo-alt-etiket">{{ bolum.etiket }}</span>
      <span v-if="etkinMi(bolum)" class="chativo-alt-isaret" />
    </RouterLink>

    <!--
      Yeni konusma: cubugun ortasi, bas parmagin dogal yeri.
      Digerlerinden ayri duruyor cunku bu bir yer degil bir **eylem**;
      gezinme ogeleriyle ayni bicimde cizilseydi "nereye gidiyorum"
      sorusunu sordururdu.
    -->
    <ComposeConversation align="start">
      <template #trigger="{ isOpen }">
        <button
          type="button"
          class="chativo-alt-oge chativo-alt-eylem"
          :class="{ 'chativo-alt-eylem-acik': isOpen }"
          :aria-label="$t('CHAT_LIST.NEW_CONVERSATION')"
        >
          <span class="chativo-alt-yuvarlak">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
        </button>
      </template>
    </ComposeConversation>

    <RouterLink
      v-for="bolum in bolumler.slice(1)"
      :key="bolum.ad"
      :to="bolum.hedef"
      class="chativo-alt-oge"
      :class="{ 'chativo-alt-etkin': etkinMi(bolum) }"
      @click="emit('closeSidebar')"
    >
      <span class="chativo-alt-ikon">
        <svg v-if="etkinMi(bolum)" viewBox="0 0 24 24" fill="currentColor">
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
        <span
          v-if="bolum.sayac && bolum.sayac.value > 0"
          class="chativo-alt-sayac"
        >
          {{ bolum.sayac.value > 99 ? '99+' : bolum.sayac.value }}
        </span>
      </span>
      <span class="chativo-alt-etiket">{{ bolum.etiket }}</span>
      <span v-if="etkinMi(bolum)" class="chativo-alt-isaret" />
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
  z-index: 45;
  bottom: max(12px, env(safe-area-inset-bottom));
  left: 10px;
  right: 10px;
  display: flex;
  gap: 2px;
  align-items: stretch;
  padding: 10px 6px 9px;
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
  position: relative;
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
  transition: color 160ms ease-out;
}

/*
 * Dokunma geri bildirimi.
 *
 * Telefonda "bastim mi" sorusu hic sorulmamali. Basiliyken ikon hafifce
 * kuculuyor; birakinca eski boyutuna donuyor. Hover degil `:active`,
 * cunku dokunmatik ekranda hover yapisip kaliyor.
 */
.chativo-alt-oge:active .chativo-alt-ikon,
.chativo-alt-oge:active .chativo-alt-yuvarlak {
  transform: scale(0.88);
}

.chativo-alt-etkin {
  color: rgb(231 233 238);
}

/*
 * Etkin bolumun alt isareti.
 *
 * Renk ve dolu/cizgi ikon farki tek basina yetmiyordu: ikisi de renge
 * yakin sinyaller ve kucuk ekranda goz onlari taramiyor. Konum farki
 * (altta duran kisa cizgi) uzaktan bakinca bile okunuyor.
 */
.chativo-alt-isaret {
  position: absolute;
  bottom: -9px;
  width: 16px;
  height: 2px;
  background: currentcolor;
  border-radius: 999px;
}

.chativo-alt-oge:focus-visible {
  outline: 2px solid rgb(110 76 255);
  outline-offset: 2px;
  border-radius: 14px;
}

.chativo-alt-ikon {
  position: relative;
  display: flex;
  transition: transform 160ms ease-out;
}

.chativo-alt-ikon svg {
  display: block;
  width: 25px;
  height: 25px;
}

.chativo-alt-etiket {
  max-width: 100%;
  overflow: hidden;
  font-size: 10.5px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0.01em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chativo-alt-sayac {
  position: absolute;
  top: -3px;
  inset-inline-start: 14px;
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

/* Sayisiz uyari: "bakilacak bir sey var" demek yetiyor. */
.chativo-alt-nokta {
  position: absolute;
  top: -1px;
  inset-inline-start: 17px;
  width: 8px;
  height: 8px;
  background: rgb(45 212 191);
  border: 2px solid rgb(20 22 27);
  border-radius: 999px;
}

/*
 * Yeni konusma dugmesi.
 *
 * Gezinme ogeleri gibi cizilmiyor: bu bir yer degil eylem. Etiketi de yok -
 * arti isareti evrensel ve etiket koymak cubugu kalabaliklastiriyordu.
 */
.chativo-alt-eylem {
  flex: 0 0 auto;
  justify-content: center;
  padding: 0 6px;
}

.chativo-alt-yuvarlak {
  display: grid;
  place-content: center;
  width: 42px;
  height: 42px;
  color: rgb(255 255 255);
  background: rgb(110 76 255);
  border-radius: 999px;
  box-shadow: 0 4px 12px rgb(110 76 255 / 35%);
  transition:
    transform 160ms ease-out,
    filter 160ms ease-out;
}

.chativo-alt-yuvarlak svg {
  width: 22px;
  height: 22px;
}

.chativo-alt-eylem-acik .chativo-alt-yuvarlak {
  filter: brightness(1.15);
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

@media (prefers-reduced-motion: reduce) {
  .chativo-alt-ikon,
  .chativo-alt-yuvarlak,
  .chativo-alt-oge {
    transition: none;
  }

  .chativo-alt-oge:active .chativo-alt-ikon,
  .chativo-alt-oge:active .chativo-alt-yuvarlak {
    transform: none;
  }
}
</style>
