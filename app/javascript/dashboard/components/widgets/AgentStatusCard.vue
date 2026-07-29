<script setup>
import { computed, h } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAlert } from 'dashboard/composables';
import { useMapGetter, useStore } from 'dashboard/composables/store';
import { useImpersonation } from 'dashboard/composables/useImpersonation';
import wootConstants from 'dashboard/constants/globals';

import Avatar from 'dashboard/components-next/avatar/Avatar.vue';
import {
  DropdownContainer,
  DropdownBody,
  DropdownItem,
} from 'next/dropdown-menu/base';

defineProps({
  // Compact mode renders just the avatar with its status dot, so the status
  // control can live inside the list header instead of taking its own row.
  compact: { type: Boolean, default: false },
});

const { t } = useI18n();
const store = useStore();
const { isImpersonating } = useImpersonation();

const currentUser = useMapGetter('getCurrentUser');
const currentAccountId = useMapGetter('getCurrentAccountId');
const currentUserAvailability = useMapGetter('getCurrentUserAvailability');

const { AVAILABILITY_STATUS_KEYS } = wootConstants;
const statusColors = ['bg-n-teal-9', 'bg-n-amber-9', 'bg-n-slate-9'];

const availabilityStatuses = computed(() => {
  const labels = [
    t('PROFILE_SETTINGS.FORM.AVAILABILITY.STATUS.ONLINE'),
    t('PROFILE_SETTINGS.FORM.AVAILABILITY.STATUS.BUSY'),
    t('PROFILE_SETTINGS.FORM.AVAILABILITY.STATUS.OFFLINE'),
  ];

  return labels.map((label, index) => ({
    label,
    value: AVAILABILITY_STATUS_KEYS[index],
    color: statusColors[index],
    icon: h('span', { class: [statusColors[index], 'size-[12px] rounded'] }),
    active: currentUserAvailability.value === AVAILABILITY_STATUS_KEYS[index],
  }));
});

const activeStatus = computed(() =>
  availabilityStatuses.value.find(status => status.active)
);

function changeAvailabilityStatus(availability) {
  if (isImpersonating.value) {
    useAlert(t('PROFILE_SETTINGS.FORM.AVAILABILITY.IMPERSONATING_ERROR'));
    return;
  }
  try {
    store.dispatch('updateAvailability', {
      availability,
      account_id: currentAccountId.value,
    });
  } catch (error) {
    useAlert(t('PROFILE_SETTINGS.FORM.AVAILABILITY.SET_AVAILABILITY_ERROR'));
  }
}
</script>

<template>
  <DropdownContainer :class="compact ? 'shrink-0' : 'px-3 pt-1 pb-2'">
    <template #trigger="{ toggle }">
      <button
        v-if="compact"
        v-tooltip.bottom="activeStatus?.label"
        type="button"
        class="grid place-content-center rounded-full transition-colors size-8 hover:bg-n-alpha-1"
        :aria-label="activeStatus?.label"
        @click="toggle"
      >
        <Avatar
          :name="currentUser.name || ''"
          :src="currentUser.avatar_url"
          :size="26"
          :status="currentUserAvailability"
          rounded-full
        />
      </button>
      <button
        v-else
        type="button"
        class="flex gap-2 items-center px-2 py-1.5 w-full rounded-lg outline outline-1 outline-n-weak hover:bg-n-alpha-1"
        @click="toggle"
      >
        <Avatar
          :name="currentUser.name || ''"
          :src="currentUser.avatar_url"
          :size="28"
          :status="currentUserAvailability"
          rounded-full
        />
        <div class="flex-grow min-w-0 text-start">
          <div class="text-sm truncate text-n-slate-12">
            {{ currentUser.name }}
          </div>
          <div class="flex gap-1.5 items-center text-xs text-n-slate-11">
            <span
              v-if="activeStatus"
              class="rounded-sm size-2 shrink-0"
              :class="activeStatus.color"
            />
            <span class="truncate">{{ activeStatus?.label }}</span>
          </div>
        </div>
        <span class="i-lucide-chevron-down size-4 text-n-slate-10 shrink-0" />
      </button>
    </template>
    <DropdownBody class="min-w-40 z-20">
      <DropdownItem
        v-for="status in availabilityStatuses"
        :key="status.value"
        :label="status.label"
        :icon="status.icon"
        class="cursor-pointer"
        @click="changeAvailabilityStatus(status.value)"
      />
    </DropdownBody>
  </DropdownContainer>
</template>
