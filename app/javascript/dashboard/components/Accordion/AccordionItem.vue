<script setup>
import EmojiOrIcon from 'shared/components/EmojiOrIcon.vue';

defineProps({
  title: {
    type: String,
    required: true,
  },
  compact: {
    type: Boolean,
    default: false,
  },
  icon: {
    type: String,
    default: '',
  },
  emoji: {
    type: String,
    default: '',
  },
  isOpen: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['toggle']);

const onToggle = () => {
  emit('toggle');
};
</script>

<template>
  <!-- Her bolum cerceveli bir kutuydu; sekiz kapali kutu yan yana gelince panel
       bos bir ayar listesine donuyordu. Artik yalnizca hairline ayrac var. -->
  <div class="text-sm border-b border-n-weak last:border-b-0">
    <button
      class="flex items-center justify-between w-full gap-2 px-3 py-2.5 m-0 select-none cursor-grab drag-handle"
      @click.stop="onToggle"
    >
      <div class="flex items-center min-w-0 gap-2">
        <EmojiOrIcon
          class="inline-block w-4 text-n-slate-10"
          :icon="icon"
          :emoji="emoji"
        />
        <h5 class="m-0 text-sm font-medium truncate text-n-slate-12">
          {{ title }}
        </h5>
      </div>
      <div class="flex flex-row items-center gap-1">
        <slot name="button" />
        <span
          class="flex-shrink-0 size-4 text-n-slate-10"
          :class="isOpen ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
        />
      </div>
    </button>
    <div v-if="isOpen" :class="compact ? 'p-0' : 'px-3 pb-4'">
      <slot />
    </div>
  </div>
</template>
