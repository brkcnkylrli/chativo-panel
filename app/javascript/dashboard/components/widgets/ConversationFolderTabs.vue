<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAccount } from 'dashboard/composables/useAccount';
import { useMapGetter } from 'dashboard/composables/store';

const props = defineProps({
  activeFolderId: { type: [String, Number], default: 0 },
});

const emit = defineEmits(['addFolder']);

const { t } = useI18n();
const { accountScopedRoute } = useAccount();

const folders = useMapGetter('customViews/getConversationCustomViews');

const hasFolders = computed(() => folders.value.length > 0);

const isFolderActive = id => Number(props.activeFolderId) === Number(id);

const isAllActive = computed(() => !Number(props.activeFolderId));
</script>

<template>
  <div
    v-if="hasFolders"
    class="flex gap-1.5 items-center px-3 pt-0.5 pb-1 overflow-x-auto no-scrollbar"
  >
    <RouterLink
      :to="accountScopedRoute('home')"
      class="px-2.5 py-1 rounded-full whitespace-nowrap text-xs shrink-0"
      :class="
        isAllActive
          ? 'bg-n-slate-4 text-n-slate-12'
          : 'text-n-slate-11 hover:bg-n-alpha-1'
      "
    >
      {{ t('CHAT_LIST.FOLDER_TABS_ALL') }}
    </RouterLink>
    <RouterLink
      v-for="folder in folders"
      :key="folder.id"
      :to="accountScopedRoute('folder_conversations', { id: folder.id })"
      class="px-2.5 py-1 rounded-full whitespace-nowrap text-xs shrink-0"
      :class="
        isFolderActive(folder.id)
          ? 'bg-n-slate-4 text-n-slate-12'
          : 'text-n-slate-11 hover:bg-n-alpha-1'
      "
      :title="folder.name"
    >
      {{ folder.name }}
    </RouterLink>
    <button
      type="button"
      class="flex justify-center items-center rounded-full size-6 shrink-0 text-n-slate-11 hover:bg-n-alpha-1"
      :title="t('FILTER.TOOLTIP_LABEL')"
      @click="emit('addFolder')"
    >
      <span class="i-lucide-plus size-3.5" />
    </button>
  </div>
</template>
