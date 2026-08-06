<script setup>
import { computed, toRef } from 'vue';
import { useRouter } from 'vue-router';
import FluentIcon from 'shared/components/FluentIcon/Index.vue';
import HeaderActions from './HeaderActions.vue';
import AvailabilityContainer from 'widget/components/Availability/AvailabilityContainer.vue';
import { useAvailability } from 'widget/composables/useAvailability';
import { useMapGetter } from 'dashboard/composables/store.js';

const props = defineProps({
  avatarUrl: { type: String, default: '' },
  title: { type: String, default: '' },
  showPopoutButton: { type: Boolean, default: false },
  showBackButton: { type: Boolean, default: false },
  availableAgents: { type: Array, default: () => [] },
});

const availableAgents = toRef(props, 'availableAgents');

const router = useRouter();
const { isOnline: temsilciCevrimici } = useAvailability(availableAgents);

/**
 * Chativo: asistan modunda baslik her zaman cevrimici.
 *
 * Chatwoot cevrimici durumunu "musait insan temsilci var mi" diye
 * hesapliyor. Asistanli bir gelen kutusunda insan cogu zaman cevrimdisi ve
 * widget "operatorlerimiz musait degil" diyordu; oysa asistan saniyeler
 * icinde cevap veriyor. Ayrica "genellikle birkac dakika icinde yanit
 * verir" cumlesi de urunu oldugundan yavas gosteriyordu, asistan modunda
 * yerini tek kelimeye birakiyor: Cevrimici.
 */
const asistanModu = useMapGetter('appConfig/getAsistanModu');
const isOnline = computed(() => asistanModu.value || temsilciCevrimici.value);

const onBackButtonClick = () => {
  router.replace({ name: 'home' });
};
</script>

<template>
  <header class="flex justify-between w-full p-5 bg-n-background gap-2">
    <div class="flex items-center">
      <button
        v-if="showBackButton"
        class="px-2 ltr:-ml-3 rtl:-mr-3"
        @click="onBackButtonClick"
      >
        <FluentIcon icon="chevron-left" size="24" class="text-n-slate-12" />
      </button>
      <img
        v-if="avatarUrl"
        class="w-8 h-8 ltr:mr-3 rtl:ml-3 rounded-full"
        :src="avatarUrl"
        alt="avatar"
      />
      <div class="flex flex-col gap-1">
        <div
          class="flex items-center text-base font-medium leading-4 text-n-slate-12"
        >
          <span v-dompurify-html="title" class="ltr:mr-1 rtl:ml-1" />
          <div
            :class="`h-2 w-2 rounded-full
              ${isOnline ? 'bg-n-teal-10' : 'hidden'}`"
          />
        </div>
        <span v-if="asistanModu" class="text-xs leading-3 text-n-slate-11">
          {{ $t('TEAM_AVAILABILITY.ONLINE') }}
        </span>
        <AvailabilityContainer
          v-else
          :agents="availableAgents"
          :show-header="false"
          :show-avatars="false"
          text-classes="text-xs leading-3"
        />
      </div>
    </div>
    <HeaderActions :show-popout-button="showPopoutButton" />
  </header>
</template>
