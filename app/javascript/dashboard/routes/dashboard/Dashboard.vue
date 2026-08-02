<script>
import { defineAsyncComponent, ref, computed } from 'vue';

import NextSidebar from 'next/sidebar/Sidebar.vue';
import WootKeyShortcutModal from 'dashboard/components/widgets/modal/WootKeyShortcutModal.vue';
import AddAccountModal from 'dashboard/components/app/AddAccountModal.vue';
import UpgradePage from 'dashboard/routes/dashboard/upgrade/UpgradePage.vue';

import { useUISettings } from 'dashboard/composables/useUISettings';
import { useAccount } from 'dashboard/composables/useAccount';
import { useWindowSize } from '@vueuse/core';

import wootConstants from 'dashboard/constants/globals';

const CommandBar = defineAsyncComponent(
  () => import('./commands/commandbar.vue')
);

const FloatingCallWidget = defineAsyncComponent(
  () => import('dashboard/components-next/call/FloatingCallWidget.vue')
);

import CopilotLauncher from 'dashboard/components-next/copilot/CopilotLauncher.vue';
import CopilotContainer from 'dashboard/components/copilot/CopilotContainer.vue';

// Yuzen menu dugmesi (MobileSidebarLauncher) kaldirildi: alt cubukta zaten
// "Menu" var ve ikisi ayni isi yapiyordu. Yuzen olan ayrica icerigin ustunu
// kapatiyordu - iki giris noktasi, kullanicinin denemeden ogrenemedigi bir
// fark demek.
import MobileBottomNav from 'dashboard/components-next/sidebar/MobileBottomNav.vue';
import { useCallsStore } from 'dashboard/stores/calls';

export default {
  components: {
    NextSidebar,
    CommandBar,
    WootKeyShortcutModal,
    AddAccountModal,
    UpgradePage,
    CopilotLauncher,
    CopilotContainer,
    FloatingCallWidget,
    MobileBottomNav,
  },
  setup() {
    const upgradePageRef = ref(null);
    const { uiSettings, updateUISettings } = useUISettings();
    const { accountId } = useAccount();
    const { width: windowWidth } = useWindowSize();
    const callsStore = useCallsStore();

    return {
      uiSettings,
      updateUISettings,
      accountId,
      upgradePageRef,
      windowWidth,
      hasActiveCall: computed(() => callsStore.hasActiveCall),
      hasIncomingCall: computed(() => callsStore.hasIncomingCall),
    };
  },
  data() {
    return {
      showAccountModal: false,
      showCreateAccountModal: false,
      showShortcutModal: false,
      isMobileSidebarOpen: false,
    };
  },
  computed: {
    isSmallScreen() {
      return this.windowWidth < wootConstants.SMALL_SCREEN_BREAKPOINT;
    },
    showUpgradePage() {
      return this.upgradePageRef?.shouldShowUpgradePage;
    },
    bypassUpgradePage() {
      return [
        'billing_settings_index',
        'settings_inbox_list',
        'general_settings_index',
        'agent_list',
      ].includes(this.$route.name);
    },
    previouslyUsedDisplayType() {
      const {
        previously_used_conversation_display_type: conversationDisplayType,
      } = this.uiSettings;
      return conversationDisplayType;
    },
  },
  watch: {
    isSmallScreen: {
      handler() {
        const { LAYOUT_TYPES } = wootConstants;
        if (window.innerWidth <= wootConstants.SMALL_SCREEN_BREAKPOINT) {
          this.updateUISettings({
            conversation_display_type: LAYOUT_TYPES.EXPANDED,
          });
        } else {
          this.updateUISettings({
            conversation_display_type: this.previouslyUsedDisplayType,
          });
        }
      },
      immediate: true,
    },
  },
  methods: {
    toggleMobileSidebar() {
      this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
    },
    closeMobileSidebar() {
      this.isMobileSidebarOpen = false;
    },
    openCreateAccountModal() {
      this.showAccountModal = false;
      this.showCreateAccountModal = true;
    },
    closeCreateAccountModal() {
      this.showCreateAccountModal = false;
    },
    toggleAccountModal() {
      this.showAccountModal = !this.showAccountModal;
    },
    toggleKeyShortcutModal() {
      this.showShortcutModal = true;
    },
    closeKeyShortcutModal() {
      this.showShortcutModal = false;
    },
  },
};
</script>

<template>
  <div class="flex flex-grow overflow-hidden text-n-slate-12">
    <NextSidebar
      :is-mobile-sidebar-open="isMobileSidebarOpen"
      @toggle-account-modal="toggleAccountModal"
      @open-key-shortcut-modal="toggleKeyShortcutModal"
      @close-key-shortcut-modal="closeKeyShortcutModal"
      @show-create-account-modal="openCreateAccountModal"
      @close-mobile-sidebar="closeMobileSidebar"
    />

    <main
      class="flex flex-1 h-full w-full min-h-0 px-0 overflow-hidden bg-n-surface-1"
    >
      <UpgradePage
        v-show="showUpgradePage"
        ref="upgradePageRef"
        :bypass-upgrade-page="bypassUpgradePage"
      />

      <!--
        Menu acikken arkasi karariyor.
        Onceden ortu katmani hic yoktu: menu icerigin ustune biniyor ama
        arkadaki liste tam parlaklikta duruyordu, yani menu gecici bir katman
        gibi degil yapismis bir panel gibi gorunuyordu. Karartmaya dokunmak da
        menuyu kapatiyor - telefonda beklenen davranis bu.
      -->
      <Transition name="chativo-ortu">
        <div
          v-if="isMobileSidebarOpen"
          class="chativo-menu-ortu md:hidden"
          @click="closeMobileSidebar"
        />
      </Transition>
      <template v-if="!showUpgradePage">
        <!--
          Bolumler arasi gecis.
          Alt cubuk sekmeleri yan yana ve esit; aralarinda bir yon yok, o
          yuzden kayma degil kisa bir belirme. `out-in`: eskisi tamamen
          cikmadan yenisi girmiyor - ikisi ayni anda DOM'da olsaydi konusma
          gorunumunun mutlak konumlandirilmis panelleri ust uste binerdi.
          Sure yalnizca telefonda tanimli; masaustunde gecis aninda bitiyor.
        -->
        <router-view v-slot="{ Component }">
          <Transition name="chativo-sayfa" mode="out-in">
            <component :is="Component" />
          </Transition>
        </router-view>
        <CommandBar />
        <CopilotLauncher />
        <CopilotContainer />
        <MobileBottomNav
          @toggle-sidebar="toggleMobileSidebar"
          @close-sidebar="closeMobileSidebar"
          @open-key-shortcut-modal="toggleKeyShortcutModal"
        />
        <FloatingCallWidget v-if="hasActiveCall || hasIncomingCall" />
      </template>
      <AddAccountModal
        :show="showCreateAccountModal"
        @close-account-create-modal="closeCreateAccountModal"
      />
      <WootKeyShortcutModal
        v-model:show="showShortcutModal"
        @close="closeKeyShortcutModal"
        @clickaway="closeKeyShortcutModal"
      />
    </main>
  </div>
</template>

<style scoped>
/*
 * Menunun arkasindaki karartma.
 *
 * `backdrop-filter` bilincli olarak yok: menu ekranin yarisindan fazlasini
 * kapliyor ve arkasini ayrica bulaniklastirmak orta seviye telefonlarda
 * acilis animasyonunu kekeletiyor. Duz bir karartma hem ucuz hem yeterli.
 */
.chativo-menu-ortu {
  position: fixed;
  inset: 0;
  z-index: 39; /* menu 40; karartma tam altinda kalmali */
  background: rgb(0 0 0 / 55%);
}

.chativo-ortu-enter-active,
.chativo-ortu-leave-active {
  transition: opacity 200ms ease-out;
}

.chativo-ortu-enter-from,
.chativo-ortu-leave-to {
  opacity: 0;
}

/*
 * Bolum gecisi - yalnizca telefonda.
 *
 * Masaustunde sol menu her zaman gorunuyor ve nereye gidildigi zaten belli;
 * orada gecis animasyonu yalnizca beklemek demek. Medya sorgusunun disinda
 * hicbir sure tanimli olmadigi icin gecis aninda bitiyor.
 *
 * Sureler kisa tutuldu: uzun animasyon ilk seferde hos, onuncu seferde yavas.
 */
@media (width < 768px) {
  .chativo-sayfa-enter-active {
    transition:
      opacity 140ms ease-out,
      transform 140ms ease-out;
  }

  .chativo-sayfa-leave-active {
    transition:
      opacity 100ms ease-in,
      transform 100ms ease-in;
  }

  .chativo-sayfa-enter-from {
    opacity: 0;
    transform: translateY(6px);
  }

  .chativo-sayfa-leave-to {
    opacity: 0;
    transform: translateY(-4px);
  }
}

/* Hareket duyarliligi olan kullanici icin bu bir tercih degil, erisilebilirlik. */
@media (prefers-reduced-motion: reduce) {
  .chativo-ortu-enter-active,
  .chativo-ortu-leave-active,
  .chativo-sayfa-enter-active,
  .chativo-sayfa-leave-active {
    transition: none;
  }

  .chativo-sayfa-enter-from,
  .chativo-sayfa-leave-to {
    transform: none;
  }
}
</style>
